# Architecture

This repository is the **hands** side of Salambo.

```text
Salambo app/worker = Pi brain, session, model loop, run lifecycle
this repository    = Daytona sandbox image, tools, files, extensions
```

```mermaid
flowchart TD
  Worker[Salambo worker] --> Harness[Pi AgentHarness]
  Harness --> Daytona[Daytona sandbox]
  Harness --> Bridge[Extension bridge]
  Bridge --> Sidecar[Sandbox sidecar]
  Sidecar --> Extensions[/workspace/extensions]
  Daytona --> Workspace[/workspace]
  Daytona --> Skills[/workspace/.salambo/agent/skills]
  Daytona --> Prompts[/workspace/.salambo/agent/prompts]
```

## Source directories

```text
agent/       compiled into the Pi manifest and copied for model-readable references
extensions/  copied to /workspace/extensions and loaded by the sidecar
sandbox/     used to build the sandbox image
```

## Sandbox directories

```text
/workspace                         working directory
/workspace/.salambo/agent/skills   skill files
/workspace/.salambo/agent/prompts  prompt template files
/workspace/extensions              hosted extension modules
/opt/salambo                       baked platform runtime
/run/salambo                       per-run platform state
```
