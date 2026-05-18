# Architecture

This repository is the **hands** side of Salambo.

```text
Salambo app/worker = Pi brain, session, model loop, run lifecycle
this repository    = Daytona sandbox image, tools, files, agent extensions
```

```mermaid
flowchart TD
  Worker[Salambo worker] --> Harness[Pi AgentHarness]
  Harness --> Daytona[Daytona sandbox]
  Harness --> Bridge[Extension bridge]
  Bridge --> Sidecar[Sandbox sidecar]
  Sidecar --> Extensions[/workspace/agent/extensions]
  Daytona --> Workspace[/workspace]
  Daytona --> Skills[/workspace/.salambo/agent/skills]
  Daytona --> Prompts[/workspace/.salambo/agent/prompts]
```

## Source directories

```text
agent/    agent-specific behavior: settings, system prompt, skills, prompts, extensions
sandbox/  sandbox-machine image: Dockerfile, packages, seed workspace, entrypoint
```

## Sandbox directories

```text
/workspace                         working directory
/workspace/.salambo/agent/skills   skill files
/workspace/.salambo/agent/prompts  prompt template files
/workspace/agent/extensions        hosted extension modules
/opt/salambo                       baked platform runtime
/run/salambo                       per-run platform state
```
