# Dependency Customization

Edit:

```text
sandbox/packages.mjs
```

Example:

```js
export default {
  apt: ['git', 'python3'],
  npm: [],
  pip: ['pandas==2.2.3'],
  setup: '',
};
```

## Guidelines

- Put simple package additions in `packages.mjs`.
- Use `setup` for short deterministic setup commands.
- Use `sandbox/Dockerfile` only when the setup needs explicit Docker layering or file copies.
- Pin versions for libraries that affect agent behavior.
- Avoid baking credentials or private tokens into install commands.
