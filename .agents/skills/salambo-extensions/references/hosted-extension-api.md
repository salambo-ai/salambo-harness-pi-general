# Hosted Extension API

Hosted extension files live under:

```text
agent/extensions/
```

Use `.mjs` in this template.

## Module shape

```js
export default function extension(pi) {
  pi.registerTool({ /* ... */ });
  pi.on('tool_call', (event) => ({ block: false }));
}
```

The default export may be sync or async:

```js
export default async function extension(pi) {
  // Register tools and hooks here.
}
```

## Supported `pi` methods

| Method | Supported | Purpose |
| --- | --- | --- |
| `pi.registerTool(tool)` | Yes | Register an LLM-callable hosted tool. |
| `pi.on(eventName, handler)` | Yes | Register a supported lifecycle hook. |
| `pi.setModel(model)` | Yes | Select a model from `before_agent_start` or similar hook flow. |
| `pi.registerCommand(...)` | No hosted support | Local Pi command API, not a hosted runtime contract. |
| `pi.registerShortcut(...)` | No hosted support | Local TUI API, not hosted. |
| `pi.registerFlag(...)` | No hosted support | Local CLI API, not hosted. |
| `pi.registerProvider(...)` | No hosted support | Local provider registration, not hosted. |

## Hook context

Hosted hook handlers receive a minimal context object:

```js
{
  external: unknown
}
```

Do not assume `ctx.ui`, session manager APIs, or local TUI helpers exist in hosted runtime.

## `pi.setModel(model)`

Supported model selection input:

```js
await pi.setModel({
  provider: 'openai',
  id: 'gpt-5.2',
  thinkingLevel: 'low'
});
```

or:

```js
await pi.setModel({
  provider: 'openai',
  modelId: 'gpt-5.2',
  thinkingLevel: 'low'
});
```

Allowed hosted thinking levels:

```text
off
low
medium
high
```

## Side effect rules

The Salambo CLI discovers extensions by importing the module and calling the default function during template compilation. The hosted runtime imports and calls it again inside the sandbox.

Therefore:

- Do not perform irreversible side effects at module top level.
- Do not call external APIs just to register tools unless required and safe.
- Do not start long-running watchers/timers in the factory.
- Keep the factory focused on registering tools and hooks.
- Start per-call work inside tool `execute(...)` or specific hook handlers.
