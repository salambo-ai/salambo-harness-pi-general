# `agent/settings.json` Reference

Edit:

```text
agent/settings.json
```

This file is the Salambo template runtime settings file. It is not the same shape as Pi's local `.pi/settings.json`.

## Supported shape

```json
{
  "model": {
    "provider": "openai",
    "model": "gpt-5.2",
    "thinkingLevel": "low"
  },
  "tools": [
    "bash",
    "lookup_customer"
  ]
}
```

## Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `model` | object | No | Default model selection for the deployed agent. |
| `model.provider` | string | Required if `model` exists | Provider name, for example `openai`. |
| `model.model` | string | Required if `model` exists | Model id. The compiler also accepts `modelId`, but prefer `model` in this template. |
| `model.thinkingLevel` | string | No | One of `off`, `low`, `medium`, `high`. |
| `tools` | string[] | No | Active tool names. Built-in and hosted extension tool names can be listed. |

## Thinking levels

Allowed values:

```text
off
low
medium
high
```

Do not use Pi local-only values such as `minimal` or `xhigh` in this template. The Salambo template compiler currently accepts only the four values above.

## Tool names

Built-in tool names currently recognized by the template compiler:

```text
read
write
edit
bash
grep
find
ls
```

Hosted extension tools are also valid after they are registered by an extension listed in `salambo.yaml`.

Example:

```json
{
  "tools": ["bash", "lookup_customer"]
}
```

Here `bash` is built in and `lookup_customer` must be registered by an extension.

## Default tools

If `tools` is omitted, the compiler defaults to:

```text
read, write, edit, bash, plus all discovered hosted extension tools
```

If `tools` is present, only the listed tools are active.

## Unknown or invalid tools

If a tool is listed but is neither built-in nor discovered from a hosted extension, the compiler emits a warning:

```text
Tool <name> is listed in agent/settings.json but no built-in or hosted extension tool was found.
```

Avoid relying on unknown tools. Fix the spelling or register the hosted extension tool.

## Unknown fields

The current compiler only reads:

```text
model
tools
```

Do not add new behavior by inventing fields in `agent/settings.json`. Unknown fields are not a reliable extension point.

## Common edits

### Change model

```json
{
  "model": {
    "provider": "openai",
    "model": "gpt-5.2",
    "thinkingLevel": "low"
  },
  "tools": ["bash"]
}
```

### Enable an extension tool

1. Register the tool in `agent/extensions/<name>.mjs` with `pi.registerTool(...)`.
2. Add the extension to `salambo.yaml` under `extensions`.
3. Add the tool name to `agent/settings.json` if `tools` is explicit.

```json
{
  "tools": ["bash", "lookup_customer"]
}
```
