# Sandbox Event Shapes

This file describes the global event shapes emitted by the sandbox.

It intentionally does not document the inner pi SDK payload schema in detail.
`session.event.event` is passed through as-is so the sandbox can stay neutral.

## Event Families

The sandbox emits two families of events:

- `sandbox.run.*`
- `session.event`

## `sandbox.run.init`

```json
{
  "type": "sandbox.run.init",
  "sandboxId": "sandbox-123",
  "workspace": "/workspace",
  "promptPreview": "User prompt preview",
  "metadata": {},
  "timestamp": "2026-03-17T12:00:00.000Z"
}
```

## `sandbox.run.ready`

```json
{
  "type": "sandbox.run.ready",
  "sandboxId": "sandbox-123",
  "sessionId": "pi-session-123",
  "timestamp": "2026-03-17T12:00:01.000Z"
}
```

## `sandbox.run.complete`

```json
{
  "type": "sandbox.run.complete",
  "sandboxId": "sandbox-123",
  "sessionId": "pi-session-123",
  "timestamp": "2026-03-17T12:00:05.000Z"
}
```

## `sandbox.run.cancelled`

```json
{
  "type": "sandbox.run.cancelled",
  "sandboxId": "sandbox-123",
  "sessionId": "pi-session-123",
  "timestamp": "2026-03-17T12:00:05.000Z"
}
```

## `sandbox.run.error`

```json
{
  "type": "sandbox.run.error",
  "sandboxId": "sandbox-123",
  "sessionId": "pi-session-123",
  "error": {
    "message": "Something failed",
    "name": "Error",
    "stack": "..."
  },
  "timestamp": "2026-03-17T12:00:05.000Z"
}
```

## `session.event`

```json
{
  "type": "session.event",
  "sandboxId": "sandbox-123",
  "sessionId": "pi-session-123",
  "event": {},
  "timestamp": "2026-03-17T12:00:02.000Z"
}
```

## Notes

- `sandboxId` is the outer platform/sandbox identifier.
- `sessionId` is the inner pi session identifier when known.
- `session.event.event` is intentionally opaque at the sandbox contract level.
- These events are suitable as an internal transport contract.
- Client-facing projections should be derived from these events rather than exposing them blindly.
