# Customize Docker

The sandbox image config lives in:

```text
harness-config/docker.mjs
```

That file is the source of truth for hands-side image additions:

- `apt` system packages
- `npm` global CLI tools
- `pip` Python dependencies
- `setup` one-off bootstrap shell steps

The hosted Pi brain does **not** run in this image. Salambo's worker owns the brain/session/model loop. Keep this config focused on tools and libraries that commands/extensions need inside `/workspace`.

During Docker build, the repo materializes `docker.mjs` into temporary build inputs automatically.

Use:

```bash
npm run harness:validate
npm run harness:materialize
```

Edit `Dockerfile` only when you need a deeper image change than the machine config can express.
