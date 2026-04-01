# SDK Stream Taxonomy

This note documents how the pi-based template treats inner session events.

## Summary

The sandbox owns the outer lifecycle and forwards the inner runtime stream as opaque transport data.

Preferred event shape:

- outer sandbox lifecycle events under `sandbox.run.*`
- one inner raw stream lane under `session.event`

## What The Sandbox Owns

The sandbox owns:

- `sandbox.run.init`
- `sandbox.run.ready`
- `sandbox.run.complete`
- `sandbox.run.cancelled`
- `sandbox.run.error`

Identifier split:

- `sandboxId` = outer sandbox/app run
- `sessionId` = underlying pi session

## What The Sandbox Does Not Own

The sandbox does not try to reinterpret pi session events into product-specific message types.

Instead it:

- preserves the raw pi event
- forwards it under `session.event`
- lets downstream systems derive SSE, logging, or UI projections later

## Practical Rule

Do not split the inner stream into multiple transport event families unless the platform contract changes deliberately.

For this template, `session.event` should:

- preserve the raw SDK event untouched
- avoid adding transport taxonomy such as `kind`
- avoid baking projection assumptions into the sandbox layer
