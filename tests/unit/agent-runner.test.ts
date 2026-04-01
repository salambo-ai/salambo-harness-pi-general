import test from 'node:test';
import assert from 'node:assert/strict';

import { PI_HOME } from '../../src/config/env.js';
import { getLocalEvents } from '../../src/core/event-store.js';
import { runAgentSandbox } from '../../src/core/agent-runner.js';

function makeWorkspace() {
  return {
    root: '/workspace',
    workDir: '/workspace/work',
    outputsDir: '/workspace/outputs',
    filesDir: '/workspace/work/files',
    templatesDir: '/workspace/work/templates',
  };
}

test('runAgentSandbox emits ordered sandbox run lifecycle and raw session events', async () => {
  const sentPrompts: string[] = [];
  const rememberedSessions: Array<{ sessionId: string; sessionFile?: string }> = [];
  let subscribed = false;
  let listener: ((event: unknown) => void) | undefined;
  let capturedCreateSessionOptions:
    | {
        cwd: string;
        agentDir: string;
        sessionManager: { getSessionFile(): string | undefined };
        resourceLoader: { reload(): Promise<void> };
      }
    | undefined;
  let capturedSessionManagerOptions:
    | {
        cwd: string;
        resumeSessionId?: string;
      }
    | undefined;
  let capturedResourceLoaderOptions:
    | {
        cwd: string;
        agentDir: string;
        systemPrompt?: string;
      }
    | undefined;

  const fakeSession = {
    sessionId: 'pi-session-1',
    sessionFile: '/tmp/pi-session-1.jsonl',
    async prompt(prompt: string) {
      sentPrompts.push(prompt);
      listener?.({ type: 'message_update', delta: 'hello' });
      listener?.({ type: 'agent_end', stopReason: 'end_turn' });
    },
    async abort() {},
    dispose() {},
    subscribe(fn: (event: unknown) => void) {
      listener = fn;
      subscribed = true;
      return () => {
        listener = undefined;
      };
    },
  };

  await runAgentSandbox(
    {
      sandboxId: 'runner-sandbox-1',
      prompt: 'Say hello',
      abortController: new AbortController(),
      streamName: 'agent-session:runner-sandbox-1',
      isResuming: false,
      workspace: makeWorkspace(),
    },
    {
      async createAgentSession(options) {
        capturedCreateSessionOptions = options;
        return { session: fakeSession };
      },
      async createResourceLoader(options) {
        capturedResourceLoaderOptions = options;
        return {
          async reload() {},
        };
      },
      async createSessionManager(options) {
        capturedSessionManagerOptions = options;
        return {
          getSessionFile: () => '/tmp/pi-session-1.jsonl',
        };
      },
      rememberPiSession(sessionId, sessionFile) {
        rememberedSessions.push({ sessionId, sessionFile });
      },
      createEventSink: (sandboxId, streamName) => ({
        kind: 'local',
        sandboxId,
        streamName,
      }),
      appendJsonEvent: (await import('../../src/core/event-store.js')).appendJsonEvent,
      sendSessionEventToStream: (await import('../../src/core/event-store.js')).sendSessionEventToStream,
      finishSandboxLifecycle: () => {},
    },
  );

  assert.equal(sentPrompts[0], 'Say hello');
  assert.equal(subscribed, true);
  assert.equal(capturedCreateSessionOptions?.cwd, '/workspace');
  assert.equal(capturedCreateSessionOptions?.agentDir, PI_HOME);
  assert.equal(capturedSessionManagerOptions?.cwd, '/workspace');
  assert.equal(capturedSessionManagerOptions?.resumeSessionId, undefined);
  assert.equal(capturedResourceLoaderOptions?.cwd, '/workspace');
  assert.equal(capturedResourceLoaderOptions?.agentDir, PI_HOME);
  assert.equal(capturedResourceLoaderOptions?.systemPrompt, undefined);
  assert.deepEqual(rememberedSessions, [
    { sessionId: 'pi-session-1', sessionFile: '/tmp/pi-session-1.jsonl' },
  ]);

  const localEvents = getLocalEvents('runner-sandbox-1', 10);
  assert.ok(localEvents);
  assert.deepEqual(
    localEvents.events.map((event) => event.payload.type),
    [
      'sandbox.run.init',
      'sandbox.run.ready',
      'session.event',
      'session.event',
      'sandbox.run.complete',
    ],
  );
});

test('runAgentSandbox emits sandbox.run.cancelled when aborted', async () => {
  const abortController = new AbortController();
  let promptCalled = false;
  let abortCalled = false;
  let listener: ((event: unknown) => void) | undefined;

  const fakeSession = {
    sessionId: 'pi-session-2',
    sessionFile: '/tmp/pi-session-2.jsonl',
    async prompt() {
      promptCalled = true;
      abortController.abort();
      listener?.({ type: 'message_update', delta: 'partial' });
    },
    async abort() {
      abortCalled = true;
    },
    dispose() {},
    subscribe(fn: (event: unknown) => void) {
      listener = fn;
      return () => {
        listener = undefined;
      };
    },
  };

  await runAgentSandbox(
    {
      sandboxId: 'runner-sandbox-2',
      prompt: 'Cancel me',
      abortController,
      streamName: 'agent-session:runner-sandbox-2',
      isResuming: false,
      workspace: makeWorkspace(),
    },
    {
      async createAgentSession() {
        return { session: fakeSession };
      },
      createResourceLoader: async () => ({
        async reload() {},
      }),
      createSessionManager: async () => ({
        getSessionFile: () => '/tmp/pi-session-2.jsonl',
      }),
      rememberPiSession: () => {},
      createEventSink: (sandboxId, streamName) => ({
        kind: 'local',
        sandboxId,
        streamName,
      }),
      appendJsonEvent: (await import('../../src/core/event-store.js')).appendJsonEvent,
      sendSessionEventToStream: (await import('../../src/core/event-store.js')).sendSessionEventToStream,
      finishSandboxLifecycle: () => {},
    },
  );

  assert.equal(promptCalled, true);
  assert.equal(abortCalled, true);

  const localEvents = getLocalEvents('runner-sandbox-2', 10);
  assert.ok(localEvents);
  assert.deepEqual(
    localEvents.events.map((event) => event.payload.type),
    ['sandbox.run.init', 'sandbox.run.ready', 'session.event', 'sandbox.run.cancelled'],
  );
});
