# Architecture

This template is a hands-only Salambo sandbox image.

```text
Salambo worker = Pi brain/session/model loop
Daytona sandbox = hands/tools/extensions/resources
```

```mermaid
flowchart TD
  API[Responses API] --> Worker[Salambo worker]
  Worker --> Harness[Pi AgentHarness]
  Harness --> Tools[Worker built-in tools]
  Harness --> ExtBridge[Extension bridge]
  Tools --> Sandbox[Daytona sandbox]
  ExtBridge --> Sidecar[Sandbox sidecar]
  Sidecar --> Extension[.salambo/extensions]
  Sandbox --> Workspace[/workspace]
  Sandbox --> AgentResources[/workspace/.salambo/agent]
```

## Responsibilities

### Salambo worker

- owns run lifecycle;
- owns Pi session/model loop;
- owns provider credentials and model selection;
- emits run events and response projections;
- starts/restarts the sandbox sidecar with fresh tokens;
- talks to Daytona for file/process operations.

### Sandbox image

- provides OS/Python/npm tools;
- contains initial workspace files;
- contains agent resources under `/workspace/.salambo/agent`;
- contains hosted extensions under `/workspace/.salambo/extensions`;
- inherits baked Salambo runtime under `/opt/salambo`;
- keeps a long-lived container process running for Daytona exec/file APIs.

## Deliberately absent

This repo should not contain a production in-sandbox agent server:

```text
/agent/query
/agent/events/:sandboxId
/workspace/files/sync
sandbox-hosted Pi sessions
sandbox S2 event bridge
```

Those belonged to the old architecture and now live in the Salambo app/worker runtime.
