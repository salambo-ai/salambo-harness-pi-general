# Releasing

This template ships Docker images through the local image helper scripts.

## Configure the Image

Edit:

- `harness-config/image.config.mjs`

Set the image repository, for example:

```js
repository: 'ghcr.io/salambo-ai/salambo-harness-pi-general'
```

Use lowercase image names for registries such as GHCR.

## Useful Commands

Print the resolved tags:

```bash
npm run image:print
```

Build the image:

```bash
npm run image:build
```

Push the image:

```bash
npm run image:push
```

Build and push in one step:

```bash
npm run image:release
```

## Versioning

By default, the image tag comes from `package.json`.

Override it for a one-off release with:

```bash
npm run image:release -- --tag 2.0.1
```

Also publish `latest` with:

```bash
npm run image:release -- --latest
```

## Machine Config Materialization

The Docker build materializes machine inputs from:

- `harness-config/docker.mjs`

Inspect the generated build files locally with:

```bash
npm run harness:materialize
```
