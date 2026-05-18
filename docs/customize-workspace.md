# Customize Workspace

Use `harness-config/initial-workspace/` to preload files into `/workspace` in the sandbox image.

Common locations:

- `harness-config/initial-workspace/work/files/` for sample inputs;
- `harness-config/initial-workspace/work/templates/` for starter assets;
- `harness-config/initial-workspace/outputs/` for output examples;
- `harness-config/initial-workspace/.pi/` for optional project-local Pi resources used during local/manual debugging.

Hosted production resources should normally live in the top-level Salambo layout instead:

```text
agent/skills/
agent/prompts/
agent/system.md
.salambo/extensions/
```

The Dockerfile copies those resources into `/workspace/.salambo/**` for sandbox-side access while the Salambo worker uses the compiled deployment manifest for Pi brain resources.
