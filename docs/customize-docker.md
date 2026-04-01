# Customize Docker

The machine/runtime config lives in `harness-config/docker.ts`.

That file is the source of truth for:

- `apt` system packages
- `npm` global CLI tools
- `pip` Python dependencies
- `setup` one-off bootstrap shell steps

By default this pi template installs the `pi` CLI globally in Docker for debugging and operator convenience, while the runtime itself uses the local Node dependency graph for the embedded SDK flow.

During Docker build, the repo materializes `docker.ts` into temporary build inputs automatically.

Edit `Dockerfile` only when you need a deeper image change than the typed machine config can express.
