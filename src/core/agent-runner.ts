import path from 'path';
import { PI_HOME, S2_STREAM_PREFIX } from '../config/env.js';
import type { WorkspacePaths } from './workspace.js';
import {
  appendJsonEvent,
  createEventSink,
  sanitizePayload,
  sendSessionEventToStream,
} from './event-store.js';
import { finishSandboxLifecycle } from './session-state.js';

export type RunSandboxOptions = {
  sandboxId: string;
  sessionId?: string;
  prompt: string;
  systemPrompt?: string;
  metadata?: Record<string, unknown>;
  abortController: AbortController;
  streamName: string;
  isResuming: boolean;
  workspace: WorkspacePaths;
};

type AgentRunnerDeps = {
  createAgentSession: (options: CreatePiSessionOptions) => Promise<{ session: PiSession }>;
  createResourceLoader: (options: CreatePiResourceLoaderOptions) => Promise<PiResourceLoader>;
  createSessionManager: (params: CreatePiSessionManagerOptions) => Promise<PiSessionManager>;
  createEventSink: typeof createEventSink;
  appendJsonEvent: typeof appendJsonEvent;
  sendSessionEventToStream: typeof sendSessionEventToStream;
  finishSandboxLifecycle: typeof finishSandboxLifecycle;
};

type PiResourceLoader = {
  reload(): Promise<void>;
};

type PiSessionManager = {
  getSessionFile(): string | undefined;
};

type PiSession = {
  sessionId: string;
  sessionFile: string | undefined;
  prompt(prompt: string): Promise<void>;
  abort(): Promise<void>;
  dispose(): void;
  subscribe(listener: (event: unknown) => void): () => void;
};

type CreatePiSessionOptions = {
  cwd: string;
  agentDir: string;
  sessionManager: PiSessionManager;
  resourceLoader: unknown;
};

type CreatePiSessionManagerOptions = {
  cwd: string;
  resumeSessionId?: string;
};

type CreatePiResourceLoaderOptions = {
  cwd: string;
  agentDir: string;
  systemPrompt?: string;
};

const defaultDeps: AgentRunnerDeps = {
  createAgentSession: async (options) => {
    const { createAgentSession } = await import('@mariozechner/pi-coding-agent');
    const result = await createAgentSession(options as any);
    return { session: result.session as PiSession };
  },
  createResourceLoader: async ({ cwd, agentDir, systemPrompt }) => {
    const { DefaultResourceLoader } = await import('@mariozechner/pi-coding-agent');
    if (systemPrompt) {
      return new DefaultResourceLoader({
        cwd,
        agentDir,
        systemPromptOverride: () => systemPrompt,
        appendSystemPromptOverride: () => [],
      });
    }

    return new DefaultResourceLoader({
      cwd,
      agentDir,
    });
  },
  createSessionManager: async ({ cwd, resumeSessionId }) => {
    const { SessionManager } = await import('@mariozechner/pi-coding-agent');
    const sessionDir = path.join(PI_HOME, 'sessions');

    if (resumeSessionId) {
      const sessions = await SessionManager.list(cwd, sessionDir);
      const match = sessions.find((session: { id?: unknown; path?: unknown }) =>
        session.id === resumeSessionId && typeof session.path === 'string',
      );

      if (!match || typeof match.path !== 'string') {
        throw new Error(`No persisted pi session found for sessionId ${resumeSessionId} in ${cwd}`);
      }

      return SessionManager.open(match.path, sessionDir) as PiSessionManager;
    }

    return SessionManager.create(cwd, sessionDir) as PiSessionManager;
  },
  createEventSink,
  appendJsonEvent,
  sendSessionEventToStream,
  finishSandboxLifecycle,
};

export function buildStreamName(sandboxId: string) {
  return `${S2_STREAM_PREFIX}:${sandboxId}`;
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  return { message: 'Unknown error' };
}

export async function runAgentSandbox(
  options: RunSandboxOptions,
  deps: AgentRunnerDeps = defaultDeps,
) {
  const startTime = Date.now();
  const stream = deps.createEventSink(options.sandboxId, options.streamName);
  const ts = () => new Date().toISOString();
  let sessionId: string | undefined = options.sessionId;
  let messageCount = 0;
  let piSession: PiSession | null = null;
  let unsubscribe: (() => void) | undefined;
  let eventChain = Promise.resolve();
  const abortSignal = options.abortController.signal;

  const abortPiSession = async () => {
    if (!piSession) return;
    try {
      await piSession.abort();
    } catch {
      // best effort
    }
  };

  const abortListener = () => {
    void abortPiSession();
  };
  abortSignal.addEventListener('abort', abortListener, { once: true });

  await deps.appendJsonEvent(stream, {
    type: 'sandbox.run.init',
    sandboxId: options.sandboxId,
    workspace: options.workspace.root,
    promptPreview: options.prompt.slice(0, 2000),
    metadata: sanitizePayload(options.metadata ?? null),
    timestamp: ts(),
  });

  if (options.isResuming && sessionId) {
    await deps.appendJsonEvent(stream, {
      type: 'sandbox.run.ready',
      sandboxId: options.sandboxId,
      sessionId,
      timestamp: ts(),
    });
  }

  try {
    const sessionManager = await deps.createSessionManager({
      cwd: options.workspace.root,
      resumeSessionId: options.isResuming ? options.sessionId : undefined,
    });
    const resourceLoader = await deps.createResourceLoader({
      cwd: options.workspace.root,
      agentDir: PI_HOME,
      systemPrompt: typeof options.systemPrompt === 'string' ? options.systemPrompt.trim() || undefined : undefined,
    });

    await resourceLoader.reload();

    const created = await deps.createAgentSession({
      cwd: options.workspace.root,
      agentDir: PI_HOME,
      sessionManager,
      resourceLoader,
    });
    piSession = created.session;
    const runtimeSessionId = piSession.sessionId;
    const stableSessionId = options.isResuming && options.sessionId ? options.sessionId : runtimeSessionId;
    sessionId = stableSessionId;

    if (!options.isResuming || !options.sessionId) {
      await deps.appendJsonEvent(stream, {
        type: 'sandbox.run.ready',
        sandboxId: options.sandboxId,
        sessionId: stableSessionId,
        timestamp: ts(),
      });
    }

    unsubscribe = piSession.subscribe((event) => {
      messageCount++;
      eventChain = eventChain
        .then(() =>
          deps.sendSessionEventToStream({
            stream,
            sandboxId: options.sandboxId,
            sessionId,
            event,
            timestamp: ts(),
          }),
        )
        .catch((streamError) => {
          console.error(`[${ts()}] Failed to publish pi session event`, streamError);
        });
    });

    if (abortSignal.aborted) {
      throw new Error('Sandbox aborted before prompt dispatch');
    }

    await piSession.prompt(options.prompt);
    await eventChain;

    await deps.appendJsonEvent(stream, {
      type: abortSignal.aborted ? 'sandbox.run.cancelled' : 'sandbox.run.complete',
      sandboxId: options.sandboxId,
      sessionId,
      timestamp: ts(),
    });
  } catch (error) {
    const aborted = abortSignal.aborted;
    console.error(`[${ts()}] Sandbox failed: ${options.sandboxId}`, error);

    try {
      await deps.appendJsonEvent(stream, {
        type: aborted ? 'sandbox.run.cancelled' : 'sandbox.run.error',
        sandboxId: options.sandboxId,
        sessionId,
        error: aborted ? undefined : serializeError(error),
        timestamp: ts(),
      });
    } catch (streamError) {
      console.error(`[${ts()}] Failed to publish sandbox error`, streamError);
    }
  } finally {
    abortSignal.removeEventListener('abort', abortListener);
    unsubscribe?.();
    await eventChain;

    if (piSession) {
      try {
        piSession.dispose();
      } catch {
        // best effort
      }
    }

    deps.finishSandboxLifecycle(options.sandboxId);
    const duration = Date.now() - startTime;
    console.log(`[${ts()}] Sandbox ${options.sandboxId} finished in ${duration}ms (${messageCount} messages)`);
  }
}
