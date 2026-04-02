# Architecture

This repo is split into three layers.

## 1. Platform Code

Located in:

- `src/routes/`
- `src/core/`
- `src/platform/`

This layer owns:

- HTTP endpoints
- sandbox lifecycle orchestration
- event emission
- workspace setup and sync plumbing
- the adapter from the Salambo contract to the inner agent runtime

This layer should stay stable.

## 2. Harness Configuration

Located in:

- `harness-config/pi-agent-home/`
- `harness-config/docker.ts`
- `harness-config/initial-workspace/`
- `harness-config/image.config.mjs`

This is the template customization surface.

Use it to control:

- template-level pi runtime settings and resources
- machine/runtime packages and setup
- initial filesystem contents, including workspace `.pi/` overrides
- image publishing defaults

## 3. Human Docs

Located in:

- `docs/`

This layer explains:

- architecture
- event contract
- testing expectations
- release flow
- customization entrypoints

## Runtime Flow

1. The HTTP API receives a sandbox request.
2. The platform layer prepares the workspace and event sink.
3. Startup seeds runtime `PI_HOME` from `harness-config/pi-agent-home/`.
4. The runner creates or resumes a pi session with `agentDir = PI_HOME` and `cwd = /workspace`, so pi sees both seeded defaults and workspace `.pi/` overrides.
5. On resume, the runner asks pi for persisted sessions in that workspace and opens the one whose pi session id matches the caller-provided `sessionId`.
6. The sandbox emits:
   - `sandbox.run.*` lifecycle events
   - raw `session.event` payloads
7. The platform consumes those events downstream for logging, SSE, and projections.

## Invariants

These should not change lightly:

- route shapes under `src/routes/`
- `sandbox.run.*` lifecycle events
- `session.event` transport shape
- `/workspace/work` and `/workspace/outputs` semantics
- bootstrap/auth behavior in Docker
- pi should be configured through native `PI_HOME` and workspace `.pi/` surfaces, not a parallel sandbox config layer
