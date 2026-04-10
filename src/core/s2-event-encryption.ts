import { createCipheriv, randomBytes } from 'node:crypto';

const ENCRYPTED_S2_EVENT_TYPE = 'salambo.encrypted_event';
const ENCRYPTION_CONTEXT_PREFIX = 'salambo:s2-event:v1:';

export function encryptS2EventPayload(params: {
  payload: Record<string, unknown>;
  key: string;
  streamName: string;
}) {
  const parsedKey = parseKey(params.key);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', parsedKey, iv);
  cipher.setAAD(buildAad(params.streamName));
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(params.payload), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    type: ENCRYPTED_S2_EVENT_TYPE,
    v: 1,
    kid: 's2-event-v1',
    alg: 'aes-256-gcm',
    payload_enc: Buffer.concat([iv, ciphertext, tag]).toString('base64url'),
  };
}

function parseKey(value: string) {
  if (/^[A-Fa-f0-9]+$/.test(value) && value.length === 64) {
    return Buffer.from(value, 'hex');
  }

  const base64 = Buffer.from(value, 'base64');
  if (base64.length === 32) {
    return base64;
  }

  throw new Error('S2_EVENT_ENCRYPTION_KEY must be 32 bytes (hex or base64)');
}

function buildAad(streamName: string) {
  if (!streamName || typeof streamName !== 'string') {
    throw new Error('S2 streamName is required for S2 event writes');
  }

  return Buffer.from(`${ENCRYPTION_CONTEXT_PREFIX}${streamName}`, 'utf8');
}
