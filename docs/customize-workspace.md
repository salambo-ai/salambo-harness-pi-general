# Customize Workspace

Use `harness-config/initial-workspace/` to preload files into the sandbox volume.

Most useful locations:

- `harness-config/initial-workspace/work/files/` for inputs
- `harness-config/initial-workspace/work/templates/` for starter assets
- `harness-config/initial-workspace/outputs/` for preseeded output examples
- `harness-config/initial-workspace/.pi/` for project-local pi overrides

The runtime also ensures these directories exist at startup from the sandbox app code because the workspace layout is part of the platform contract.

Use `.pi/` when the customization belongs to the sandboxed project rather than the template image itself. Typical examples:

- `.pi/settings.json`
- `.pi/extensions/`
- `.pi/skills/`
- `.pi/prompts/`
- `.pi/themes/`
