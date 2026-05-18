# Contributing

This repo is a Salambo hands sandbox template.

Keep the ownership split clear:

```text
agent/      brain inputs compiled by Salambo CLI
extensions/ sandbox extension code
sandbox/    sandbox image inputs
```

Before opening a PR, run:

```bash
npm run sandbox:validate
npm test
npm run sandbox:materialize
```

If you changed `Dockerfile` or `sandbox/**`, also build the image when you have base-image registry access:

```bash
npm run docker:build
```

Protect these path contracts:

```text
/workspace
/workspace/.salambo/agent/skills
/workspace/.salambo/agent/prompts
/workspace/extensions
/opt/salambo
/run/salambo
```

Do not add app/server/runtime orchestration code to this repo. That belongs in the Salambo app/worker.
