# Template Lifecycle

## Build-time

Salambo reads this repo as source, compiles agent resources, builds the sandbox image, and creates a runnable snapshot.

## Run-time

During a run, Salambo owns the model loop and orchestration. The sandbox provides a workspace, dependencies, extension code, and files the agent can use.

## Durable vs temporary state

| State | Location | Durable across deploys? | Notes |
| --- | --- | --- | --- |
| Agent config | `agent/` | Yes, through source control and deployments | Edit in repo. |
| Sandbox image inputs | `sandbox/` | Yes, through source control and deployments | Rebuild required. |
| Runtime work files | `/workspace` | Run/sandbox scoped | Publish important outputs as artifacts when available. |
| Platform state | `/run/salambo` | No | Runtime-owned scratch/control state. |
| Builder macro docs | `.agents/skills/` | Yes, repo-local | For engineers and coding assistants only. |
