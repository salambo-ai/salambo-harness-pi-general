# Customize Sandbox Packages

Edit:

```text
sandbox/packages.mjs
```

That file controls what is installed into the Daytona sandbox image:

- `apt`: Debian packages;
- `npm`: global npm tools;
- `pip`: Python packages;
- `setup`: one-off shell setup.

Validate it with:

```bash
npm run sandbox:validate
```

Materialize the generated install files with:

```bash
npm run sandbox:materialize
```

Edit `Dockerfile` only when the sandbox image needs a structural change that `sandbox/packages.mjs` cannot express.
