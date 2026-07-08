# Extension Testing

## Syntax check

```bash
node --check agent/extensions/<extension>.mjs
```

## Discovery check

The Salambo CLI discovers extension tools and hooks by importing the extension and calling its default export. Keep the factory safe to run during deployment compilation.

A good extension factory should:

- register tools;
- register hooks;
- avoid irreversible side effects;
- avoid long-running background work.

## Test cases

For every tool, test:

- valid input;
- missing required fields;
- invalid paths or identifiers;
- expected external API failures;
- redaction of sensitive fields.

## Wiring checklist

- Extension file exists under `agent/extensions/`.
- Extension exports a default function.
- `salambo.yaml` includes the extension path.
- `agent/settings.json` includes the tool name if `tools` is explicit.
- Tool name matches `/^[a-zA-Z0-9_-]{1,64}$/`.
- Tool has a non-empty description.
- Tool parameters are a JSON-schema-like object.
