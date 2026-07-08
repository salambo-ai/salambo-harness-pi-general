# Supported Hosted Extension Hooks

Register hooks with:

```js
pi.on('<hook_name>', async (event, ctx) => {
  // ...
});
```

Only the hooks in this file are supported by Salambo hosted extensions today. Other Pi local extension events may exist, but are not a hosted runtime contract.

## Hook summary

| Hook | When it runs | Can modify behavior? |
| --- | --- | --- |
| `before_agent_start` | Before an agent response starts | Yes: inject messages, replace system prompt, select model. |
| `context` | Before provider request context is assembled | Yes: replace messages. |
| `before_provider_request` | Before provider payload is sent | Yes: replace provider payload. |
| `after_provider_response` | After provider response headers/status are observed | Observe only. |
| `tool_call` | Before a tool executes | Yes: block or mutate input. |
| `tool_result` | After a tool returns | Yes: rewrite result content/details/error state. |
| `model_select` | When model selection changes | Observe only. |
| `session_before_compact` | Before compaction | Yes: cancel or provide compaction. |
| `session_compact` | After compaction | Observe only. |
| `session_before_tree` | Before tree/branch summary behavior | Yes: cancel or customize summary instructions. |
| `session_tree` | After tree navigation/summary | Observe only. |

## `before_agent_start`

Event shape:

```js
{
  type: 'before_agent_start',
  prompt: string,
  images?: unknown[],
  systemPrompt: string,
  resources: object
}
```

Return shape:

```js
{
  message?: object,
  messages?: object[],
  systemPrompt?: string
}
```

You can also call `await pi.setModel(...)` inside the hook to select a model for this turn.

Example:

```js
pi.on('before_agent_start', async (event) => {
  if (!event.prompt.includes('USE_SHORT_MODE')) return undefined;

  return {
    systemPrompt: `${event.systemPrompt}\nAnswer in at most five bullets.`,
    message: {
      customType: 'short-mode',
      content: [{ type: 'text', text: 'Use concise mode for this turn.' }],
      display: 'hidden'
    }
  };
});
```

## `context`

Event shape:

```js
{
  type: 'context',
  messages: object[]
}
```

Return shape:

```js
{
  messages: object[]
}
```

Use this to add or replace messages before provider context is finalized.

## `before_provider_request`

Event shape:

```js
{
  type: 'before_provider_request',
  payload: unknown
}
```

Return the replacement provider payload directly:

```js
pi.on('before_provider_request', (event) => {
  const payload = structuredClone(event.payload);
  // mutate payload safely
  return payload;
});
```

Limits:

- result must be JSON-serializable;
- encoded payload must not exceed the hosted runtime limit.

Use this hook sparingly. It is provider-payload-level and easy to break.

## `after_provider_response`

Event shape:

```js
{
  type: 'after_provider_response',
  status: number,
  headers: object
}
```

Return value is ignored. Use this for observation only.

Do not log sensitive headers.

## `tool_call`

Event shape:

```js
{
  type: 'tool_call',
  toolCallId: string,
  toolName: string,
  input: object
}
```

Return shape to block:

```js
{
  block: true,
  reason: 'Human readable reason'
}
```

Return shape to allow:

```js
{
  block: false
}
```

You may mutate `event.input` to change tool arguments before execution:

```js
pi.on('tool_call', (event) => {
  if (event.toolName === 'bash' && event.input.command === 'date') {
    event.input.command = 'date -u';
  }
  return { block: false };
});
```

## `tool_result`

Event shape:

```js
{
  type: 'tool_result',
  toolCallId: string,
  toolName: string,
  input: object,
  content: object[],
  details: unknown,
  isError: boolean
}
```

Return any fields to replace:

```js
{
  content?: object[],
  details?: unknown,
  isError?: boolean
}
```

Example:

```js
pi.on('tool_result', (event) => {
  if (event.toolName !== 'lookup_customer') return undefined;
  return {
    content: [{ type: 'text', text: 'Customer lookup completed.' }],
    details: event.details,
    isError: false
  };
});
```

## `model_select`

Event shape:

```js
{
  type: 'model_select',
  model: unknown,
  previousModel: unknown,
  source: string
}
```

Return value is ignored. Use for observation only.

## `session_before_compact`

Event shape:

```js
{
  type: 'session_before_compact',
  preparation: unknown,
  branchEntries: unknown[],
  customInstructions?: string
}
```

Supported return shape:

```js
{
  cancel?: true,
  compaction?: object
}
```

## `session_compact`

Event shape:

```js
{
  type: 'session_compact',
  compactionEntry: unknown,
  fromHook: boolean
}
```

Return value is ignored.

## `session_before_tree`

Event shape:

```js
{
  type: 'session_before_tree',
  preparation: unknown
}
```

Supported return shape:

```js
{
  cancel?: true,
  replaceInstructions?: boolean,
  customInstructions?: string,
  label?: string,
  summary?: object
}
```

## `session_tree`

Event shape:

```js
{
  type: 'session_tree',
  newLeafId: string | null,
  oldLeafId: string | null,
  summaryEntry?: unknown,
  fromHook: boolean
}
```

Return value is ignored.
