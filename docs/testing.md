# Testing

This template keeps tests intentionally small.

Run:

```bash
npm run sandbox:validate
npm test
npm run sandbox:materialize
```

`npm test` currently validates the sandbox package config. Full run behavior is tested by deployed Salambo smokes, because the Pi brain and run lifecycle live in the Salambo app/worker.

For Docker changes, also run when you have base-image registry access:

```bash
npm run docker:build
```
