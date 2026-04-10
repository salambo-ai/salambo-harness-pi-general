# Event Contract

The backend integration contract is intentionally fixed in this template.

Do not casually change:

- `src/routes/agent.ts`
- `src/routes/workspace.ts`
- `src/core/agent-runner.ts`
- `src/core/event-store.ts`

Those files define:

- HTTP endpoints expected by the app
- S2 stream naming
- event payload shapes
- local fallback event behavior

Current event types:

- `sandbox.run.init`
- `sandbox.run.ready`
- `sandbox.run.complete`
- `sandbox.run.cancelled`
- `sandbox.run.error`
- `session.event`

Identifier split:

- `sandboxId` = outer sandbox/platform run
- `sessionId` = inner pi session when known

See [pi-sandbox-event-contract.md](/C:/Users/nicol/WebstormProjects/salambo-sandbox/salambo-sandbox-pi-sdk/docs/pi-sandbox-event-contract.md) for the raw sandbox event contract and the platform-adaptation boundary.
