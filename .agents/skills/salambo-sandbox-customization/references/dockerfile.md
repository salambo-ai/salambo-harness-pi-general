# Dockerfile Guidance

Edit:

```text
sandbox/Dockerfile
```

Use the Dockerfile for image-level changes that cannot be expressed cleanly in `sandbox/packages.mjs`.

## What this Dockerfile owns

The Dockerfile builds the Daytona sandbox image that Salambo attaches to for worker-owned Pi runs.

It owns:

- the Salambo runtime base image;
- package installation;
- `/workspace` creation and seeding;
- `/run/salambo` writable run-state directories;
- `/opt/salambo/agent` baked agent resources;
- entrypoint installation;
- default non-root user and environment.

## Do not delete or casually change

| Invariant | Why it matters |
| --- | --- |
| `FROM registry.depot.dev/...salambo-sandbox-runtime-base...` | Provides the platform-owned Salambo runtime and extension sidecar under `/opt/salambo`. |
| `/opt/salambo` permissions | The baked runtime must remain readable/executable. |
| `/run/salambo` creation and ownership | Per-run sidecar/control state must be writable by the sandbox user. |
| `/run/salambo/extension-host` | Hosted extension sidecar uses this area for runtime state. |
| `COPY agent/system.md /opt/salambo/agent/system.md` | Provides the deployed agent's system prompt. |
| `COPY agent/settings.json /opt/salambo/agent/settings.json` | Provides model/tool settings. |
| `COPY agent/skills/ /opt/salambo/agent/skills/` | Provides runtime skills. |
| `COPY agent/prompts/ /opt/salambo/agent/prompts/` | Provides runtime prompt templates. |
| `COPY agent/extensions/ /opt/salambo/agent/extensions/` | Provides hosted extension modules. |
| `COPY sandbox/entrypoint.sh /app/sandbox/entrypoint.sh` | Installs startup behavior required by the sandbox lifecycle. |
| `USER node` | Keeps normal runtime execution non-root. |
| `ENV WORKSPACE_DIR=/workspace` | Gives tools a stable workspace path. |
| `CMD ["/app/sandbox/entrypoint.sh"]` | Starts the sandbox in the expected attachable mode. |

Change these only when intentionally changing the runtime architecture.

## Safe common changes

- Add apt/npm/pip packages through `sandbox/packages.mjs`.
- Add deterministic setup commands through `sandbox/packages.mjs`.
- Copy additional static assets needed by tools.
- Create extra directories under `/workspace` or another clearly owned path.
- Install native libraries required by extension tools.

## Risky changes

- Replacing the base image.
- Removing `/opt/salambo` or `/run/salambo` setup.
- Running a custom server as the main process.
- Switching away from the `node` user without understanding permissions.
- Moving agent resources out of `/opt/salambo/agent`.
- Writing platform helper code into `/workspace` as if it were user work.
- Baking secrets into image layers.

## Rules

- Keep layers readable.
- Copy only files needed by the runtime.
- Preserve ownership and permissions for files copied into `/workspace`.
- Do not add an app server unless the template intentionally changes architecture.
- Do not bake secrets into the image.
- Prefer `sandbox/packages.mjs` for dependency lists.
- Keep Salambo-owned runtime files outside `/workspace`.

## Common tasks

- Install native libraries.
- Copy static assets.
- Configure language runtimes.
- Create directories needed by extension tools.
