# Extension Wiring in `salambo.yaml`

Declare hosted extension files under:

```yaml
extensions:
  - path: agent/extensions/smoke.mjs
    mode: auto
```

## Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | Extension path relative to the template root. |
| `mode` | `auto`, `lazy`, or `eager` | No | Load mode hint. Current compiler emits `eager` only when set to `eager`; otherwise it compiles as lazy. |

## Path rules

- Must be relative to the template root.
- Must not be absolute.
- Must not start with `../`.
- Must not contain `/../`.
- Use `.mjs` in this template.

## Tool activation

Declaring an extension makes its tools discoverable. If `agent/settings.json` has an explicit `tools` array, add the extension tool name there too.

Example:

```json
{
  "tools": ["bash", "lookup_customer"]
}
```

If `tools` is omitted, discovered extension tools are active by default alongside default built-in tools.
