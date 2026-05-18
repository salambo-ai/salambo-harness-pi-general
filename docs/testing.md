# Testing

This template intentionally has no test framework.

Run the validation commands from `README.md`:

```bash
node --check agent/extensions/smoke.mjs
node --input-type=module -e "const c=(await import('./sandbox/packages.mjs')).default; for (const k of ['apt','npm','pip']) if (!Array.isArray(c[k]) || c[k].some((x)=>typeof x !== 'string')) throw new Error(k); if (typeof c.setup !== 'string') throw new Error('setup'); console.log('sandbox/packages.mjs OK')"
```

Full run behavior is tested by deployed Salambo smokes, because the Pi brain and run lifecycle live in the Salambo app/worker.

For Docker changes, also run when you have base-image registry access:

```bash
docker build -f sandbox/Dockerfile .
```
