import test from 'node:test';
import assert from 'node:assert/strict';

import {
  appendJsonEvent,
  createEventSink,
  getLocalEvents,
  sendSessionEventToStream,
} from '../../src/core/event-store.js';

test('sendSessionEventToStream stores raw protocol events under session.event', async () => {
  const sandboxId = 'sandbox-test-1';
  const timestamp = '2026-03-16T12:00:00.000Z';
  const rawEvent = {
    method: 'thread/started',
    params: {
      threadId: 'thread-1',
      cwd: '/workspace',
    },
  };

  await sendSessionEventToStream({
    stream: createEventSink(sandboxId, 'agent-session:sandbox-test-1'),
    sandboxId,
    sessionId: 'sdk-session-1',
    event: rawEvent,
    timestamp,
  });

  const localEvents = getLocalEvents(sandboxId, 10);
  assert.ok(localEvents);
  assert.equal(localEvents.events.length, 1);

  const payload = localEvents.events[0]?.payload;
  assert.deepEqual(payload, {
    type: 'session.event',
    sandboxId,
    sessionId: 'sdk-session-1',
    event: rawEvent,
    timestamp,
  });

  assert.equal(Object.hasOwn(payload, 'message'), false);
  assert.equal(Object.hasOwn(payload, 'messageType'), false);
  assert.equal(Object.hasOwn(payload, 'kind'), false);
});

test('sendSessionEventToStream preserves parse errors without reclassification', async () => {
  const sandboxId = 'sandbox-test-2';
  const timestamp = '2026-03-16T12:05:00.000Z';
  const rawEvent = {
    type: 'parse_error',
    line: 'not-json',
    error: 'Unexpected token',
  };

  await sendSessionEventToStream({
    stream: createEventSink(sandboxId, 'agent-session:sandbox-test-2'),
    sandboxId,
    event: rawEvent,
    timestamp,
  });

  const localEvents = getLocalEvents(sandboxId, 10);
  assert.ok(localEvents);
  assert.equal(localEvents.events.length, 1);

  assert.deepEqual(localEvents.events[0]?.payload, {
    type: 'session.event',
    sandboxId,
    event: rawEvent,
    timestamp,
  });
});

test('sendSessionEventToStream encrypts S2 appends while keeping local debug events plaintext', async () => {
  const sandboxId = 'sandbox-test-3';
  const streamName = 'agent-session:sandbox-test-3';
  const timestamp = '2026-03-16T12:10:00.000Z';
  const rawEvent = {
    type: 'message_update',
    assistantMessageEvent: {
      type: 'text_delta',
      delta: 'Hello encrypted world',
    },
  };

  const appendedRecords: Array<{ body?: string | Uint8Array; headers?: unknown }> = [];
  const stream = {
    kind: 's2',
    sandboxId,
    streamName,
    s2EventEncryptionKey: Buffer.alloc(32, 7).toString('base64'),
    stream: {
      async append(record: { body?: string | Uint8Array; headers?: unknown }) {
        appendedRecords.push(record);
      },
    },
  } as unknown as ReturnType<typeof createEventSink>;

  await sendSessionEventToStream({
    stream,
    sandboxId,
    sessionId: 'sdk-session-3',
    event: rawEvent,
    timestamp,
  });

  const localEvents = getLocalEvents(sandboxId, 10);
  assert.ok(localEvents);
  assert.equal(localEvents.events.length, 1);
  assert.deepEqual(localEvents.events[0]?.payload, {
    type: 'session.event',
    sandboxId,
    sessionId: 'sdk-session-3',
    event: rawEvent,
    timestamp,
  });

  assert.equal(appendedRecords.length, 1);
  const recordBody = appendedRecords[0]?.body;
  const rawBody =
    typeof recordBody === 'string'
      ? recordBody
      : recordBody instanceof Uint8Array
        ? new TextDecoder().decode(recordBody)
        : '';
  const payload = JSON.parse(rawBody);
  assert.equal(payload.type, 'salambo.encrypted_event');
  assert.equal(payload.v, 1);
  assert.equal(payload.alg, 'aes-256-gcm');
  assert.equal(typeof payload.payload_enc, 'string');
  assert.notEqual(payload.payload_enc.includes('Hello encrypted world'), true);

  const headerValue = readHeaderValue(appendedRecords[0]?.headers, 'event-type');
  assert.equal(headerValue, 'salambo.encrypted_event');
});

test('appendJsonEvent rejects S2 writes when the event encryption key is missing', async () => {
  const stream = {
    kind: 's2',
    sandboxId: 'sandbox-test-4',
    streamName: 'agent-session:sandbox-test-4',
    stream: {
      async append() {
        throw new Error('append should not be reached without a key');
      },
    },
  } as unknown as ReturnType<typeof createEventSink>;

  await assert.rejects(
    () =>
      appendJsonEvent(stream, {
        type: 'sandbox.run.init',
        sandboxId: 'sandbox-test-4',
      }),
    /S2_EVENT_ENCRYPTION_KEY/i,
  );
});

test('appendJsonEvent rejects S2 writes when the stream name is missing', async () => {
  const stream = {
    kind: 's2',
    sandboxId: 'sandbox-test-5',
    streamName: '',
    s2EventEncryptionKey: Buffer.alloc(32, 7).toString('base64'),
    stream: {
      async append() {
        throw new Error('append should not be reached without a stream name');
      },
    },
  } as unknown as ReturnType<typeof createEventSink>;

  await assert.rejects(
    () =>
      appendJsonEvent(stream, {
        type: 'sandbox.run.init',
        sandboxId: 'sandbox-test-5',
      }),
    /streamName/i,
  );
});

function readHeaderValue(headers: unknown, name: string) {
  if (!headers) {
    return null;
  }

  if (
    typeof headers === 'object' &&
    headers !== null &&
    'get' in headers &&
    typeof (headers as { get?: unknown }).get === 'function'
  ) {
    return ((headers as { get(name: string): string | null }).get(name)) ?? null;
  }

  if (typeof headers === 'object' && headers !== null && name in headers) {
    const value = (headers as Record<string, unknown>)[name];
    return typeof value === 'string' ? value : null;
  }

  return null;
}
