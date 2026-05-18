# Customize the Sandbox Machine

Edit:

```text
sandbox/packages.mjs
```

That file controls what is installed into the Daytona sandbox image:

- `apt`: Debian packages;
- `npm`: global npm tools;
- `pip`: Python packages;
- `setup`: one-off shell setup.

The Dockerfile lives next to it:

```text
sandbox/Dockerfile
```

Edit the Dockerfile only when the sandbox image needs a structural change that `sandbox/packages.mjs` cannot express.
