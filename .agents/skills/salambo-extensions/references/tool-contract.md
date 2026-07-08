# Hosted Tool Contract

Register tools with:

```js
pi.registerTool({
  name: 'lookup_customer',
  label: 'Lookup Customer',
  description: 'Return customer information for a known customer id.',
  parameters: {
    type: 'object',
    properties: {
      customer_id: {
        type: 'string',
        description: 'Customer identifier.'
      }
    },
    required: ['customer_id'],
    additionalProperties: false
  },
  async execute(toolCallId, params, signal, onUpdate, ctx) {
    return {
      content: [{ type: 'text', text: `Customer: ${params.customer_id}` }],
      details: { customer_id: params.customer_id }
    };
  }
});
```

## Required fields

| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| `name` | string | Yes | Must match `/^[a-zA-Z0-9_-]{1,64}$/`. |
| `label` | string | No | Human-readable label. |
| `description` | string | Yes | Non-empty. Tell the model when to call it. |
| `parameters` | object | Yes | JSON-schema-like object. |
| `execute` | function | Yes at runtime | Called when the model invokes the tool. |

The compiler discovers `name`, `label`, `description`, and `parameters` by importing the extension and calling the factory.

## Execute arguments

Hosted runtime calls:

```js
execute(toolCallId, params, signal, onUpdate, ctx)
```

Current hosted behavior:

- `toolCallId`: string id for the tool call.
- `params`: model-provided arguments.
- `signal`: may be undefined in hosted runtime.
- `onUpdate`: may be undefined in hosted runtime.
- `ctx.external`: external context if Salambo provided one.

Do not require `signal`, `onUpdate`, or UI helpers to exist.

## Return shape

Recommended successful result:

```js
{
  content: [{ type: 'text', text: 'Short result for the model.' }],
  details: { structured: 'metadata' }
}
```

Error result:

```js
{
  content: [{ type: 'text', text: 'Could not find customer.' }],
  details: { code: 'not_found' },
  isError: true
}
```

## Tool design rules

- Make tools small and specific.
- Validate `params` inside `execute` even if the schema is strict.
- Keep `content` concise and useful for the model.
- Put machine-readable data in `details`.
- Never return secrets, raw auth headers, or full environment dumps.
- Avoid arbitrary shell execution from model-provided input.
