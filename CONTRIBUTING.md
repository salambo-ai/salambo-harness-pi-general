# Contributing

Keep the ownership split clear:

```text
agent/    agent-specific behavior and extension code
sandbox/  sandbox-machine image inputs
```

Before opening a PR, run the local validation commands from `README.md`.

If you changed `sandbox/Dockerfile` or `sandbox/**`, also build the image when you have base-image registry access:

```bash
docker build -f sandbox/Dockerfile .
```

Protect these path contracts:

```text
/workspace
/workspace/.salambo/agent/skills
/workspace/.salambo/agent/prompts
/workspace/agent/extensions
/opt/salambo
/run/salambo
```

Do not add app/server/runtime orchestration code to this repo. That belongs in the Salambo app/worker.
