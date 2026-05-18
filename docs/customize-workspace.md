# Customize Workspace

Use `sandbox-image/workspace/` to preload files into `/workspace` in the sandbox image.

Common locations:

- `sandbox-image/workspace/work/files/` for sample inputs;
- `sandbox-image/workspace/work/templates/` for starter assets;
- `sandbox-image/workspace/outputs/` for output examples.

Hosted production resources should normally live in the top-level Salambo layout instead:

```text
agent/skills/
agent/prompts/
agent/system.md
.salambo/extensions/
```

The Dockerfile copies those resources into `/workspace/.salambo/**` for sandbox-side access while the Salambo worker uses the compiled deployment manifest for Pi brain resources.
