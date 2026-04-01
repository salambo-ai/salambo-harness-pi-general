# Customize SDK Behavior

Edit these files first:

- `harness-config/pi-agent-home/settings.json`
- `harness-config/pi-agent-home/SYSTEM.md`
- `harness-config/pi-agent-home/extensions/`
- `harness-config/pi-agent-home/skills/`
- `harness-config/pi-agent-home/prompts/`
- `harness-config/pi-agent-home/themes/`
- `harness-config/initial-workspace/.pi/`

## Pi Config Surface

This template intentionally does not introduce a second sandbox-side agent config.

Use pi the way pi expects:

- `harness-config/pi-agent-home/settings.json` for pi settings
- `harness-config/pi-agent-home/SYSTEM.md` for the default prompt/system instructions
- `harness-config/pi-agent-home/extensions/` for bundled pi extensions
- `harness-config/pi-agent-home/skills/` for bundled pi skills
- `harness-config/pi-agent-home/prompts/` for bundled pi prompt templates
- `harness-config/pi-agent-home/themes/` for bundled pi themes
- `harness-config/initial-workspace/.pi/` for workspace-level project overrides

## `harness-config/pi-agent-home/settings.json`

This is the template-level pi settings file that seeds runtime `PI_HOME`.

Use it for:

- default model/provider selection
- tool defaults
- other pi runtime settings you want pinned inside the template

## `harness-config/pi-agent-home/SYSTEM.md`

This is the default pi system prompt seed copied into `PI_HOME` for container/local runtime use.

The runner also supports per-request `systemPrompt` overrides through the existing Salambo API.

## `harness-config/pi-agent-home/extensions/`

This is the template-level pi extension directory.

Use it exactly the way pi expects:

- single-file extension: `extensions/my-extension.ts`
- multi-file extension: `extensions/my-extension/index.ts`
- extension with its own dependencies: `extensions/my-extension/package.json`

Project-local workspace extensions can also live in `.pi/extensions/` inside the synced workspace, because the runner starts pi with `cwd` set to the sandbox workspace root.

## `harness-config/pi-agent-home/skills/`, `prompts/`, `themes/`

These are the template-level pi resource directories.

Use them when the resource should ship with the sandbox image itself.

Pi discovers them from `PI_HOME` using its normal conventions.

## `harness-config/initial-workspace/.pi/`

This seeds `/workspace/.pi/` inside the sandbox.

Use it for project-local pi overrides:

- `.pi/settings.json`
- `.pi/extensions/`
- `.pi/skills/`
- `.pi/prompts/`
- `.pi/themes/`

This is the clean place for repo-specific behavior that should travel with the synced project workspace.

## What Goes Where

| Setting | Where | Why |
|---|---|---|
| Default system prompt | `SYSTEM.md` | pi resource/config surface |
| Provider/model defaults | `settings.json` | pi runtime concern |
| Bundled pi extensions | `extensions/` | pi runtime concern |
| Bundled pi skills | `skills/` | pi runtime concern |
| Bundled pi prompt templates | `prompts/` | pi runtime concern |
| Bundled pi themes | `themes/` | pi runtime concern |
| Project-local pi overrides | `initial-workspace/.pi/` | pi project scope |
| Docker/tooling packages | `harness-config/docker.ts` | Machine/runtime concern |
| Workspace contract | sandbox app code | Platform concern |

## Runtime Note

The pi-based template does not use Codex TOML profiles.

Instead:

- the sandbox app keeps its outward HTTP/S2/workspace contract
- pi runtime behavior is configured through seeded `PI_HOME` plus workspace `.pi/`
- the runner translates pi session lifecycle into the existing `sandbox.run.*` and `session.event` event contract
