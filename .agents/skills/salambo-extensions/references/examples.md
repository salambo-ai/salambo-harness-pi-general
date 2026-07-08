# Extension Examples

## Minimal tool

```js
export default function extension(pi) {
  pi.registerTool({
    name: 'echo_value',
    label: 'Echo Value',
    description: 'Echo a provided value for testing.',
    parameters: {
      type: 'object',
      properties: {
        value: { type: 'string', description: 'Value to echo.' }
      },
      required: ['value'],
      additionalProperties: false
    },
    async execute(_toolCallId, params) {
      if (typeof params.value !== 'string') {
        return {
          content: [{ type: 'text', text: 'value must be a string' }],
          isError: true
        };
      }

      return {
        content: [{ type: 'text', text: params.value }],
        details: { value: params.value }
      };
    }
  });
}
```

## Block risky bash commands

```js
export default function extension(pi) {
  pi.on('tool_call', (event) => {
    if (event.toolName !== 'bash') return { block: false };

    const command = String(event.input?.command ?? '');
    if (/\brm\s+-rf\b/.test(command)) {
      return { block: true, reason: 'Refusing destructive recursive delete.' };
    }

    return { block: false };
  });
}
```

## Per-turn model selection

```js
export default function extension(pi) {
  pi.on('before_agent_start', async (event) => {
    if (!event.prompt.includes('deep analysis')) return undefined;

    await pi.setModel({
      provider: 'openai',
      id: 'gpt-5.2',
      thinkingLevel: 'high'
    });

    return undefined;
  });
}
```

## Good tool shape

Good tools do one thing:

```text
lookup_customer(customer_id) -> customer summary
render_report(input_path, output_path) -> report metadata
validate_csv(path, required_columns) -> validation result
```

Avoid broad tools such as:

```text
run_any_command(command)
do_everything(payload)
read_any_file(path)
```
