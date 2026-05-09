export default function extension(pi) {
  pi.on('context', (event) => {
    const asksForSmokeSecret = JSON.stringify(event.messages).includes('hosted extension context smoke secret');
    if (!asksForSmokeSecret) {
      return undefined;
    }

    return {
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Answer exactly CONTEXT_HOOK_OK and do not call tools.',
            },
          ],
        },
      ],
    };
  });

  pi.on('before_provider_request', (event) => {
    const encoded = JSON.stringify(event.payload);
    if (!encoded.includes('BEFORE_PROVIDER_REQUEST_SMOKE')) {
      return undefined;
    }

    return replaceStringValues(
      event.payload,
      'BEFORE_PROVIDER_REQUEST_SMOKE',
      'Answer exactly PROVIDER_REQUEST_HOOK_OK and do not call tools.',
    );
  });

  pi.on('tool_call', (event) => {
    if (event.toolName === 'bash' && event.input?.command?.includes('HOOK_BLOCK_ME')) {
      return { block: true, reason: 'HOOK_BLOCK_OK' };
    }

    if (event.toolName === 'bash' && event.input?.command?.includes('HOOK_MUTATE_ME')) {
      event.input.command = 'printf HOOK_MUTATION_OK';
    }

    if (event.toolName === 'lookup_customer' && event.input?.customer_id === 'mutate_customer') {
      event.input.customer_id = 'mutated_customer';
    }

    return { block: false };
  });

  pi.on('tool_result', (event) => {
    if (event.toolName === 'bash' && event.content?.[0]?.text?.includes('RESULT_REWRITE_ME')) {
      return {
        content: [{ type: 'text', text: 'TOOL_RESULT_REWRITE_OK' }],
        details: { rewritten: true },
        isError: false,
      };
    }

    if (event.toolName === 'lookup_customer' && event.content?.[0]?.text?.includes('RESULT_TOOL_REWRITE_ME')) {
      return {
        content: [{ type: 'text', text: 'EXT_TOOL_RESULT_REWRITE_OK' }],
        details: { rewritten: true },
        isError: false,
      };
    }

    return undefined;
  });

  pi.registerTool({
    name: 'lookup_customer',
    label: 'Lookup Customer',
    description: 'Return a deterministic customer smoke marker.',
    parameters: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Customer identifier to echo.',
        },
      },
      required: ['customer_id'],
      additionalProperties: false,
    },
    async execute(_toolCallId, params) {
      return {
        content: [
          {
            type: 'text',
            text: `EXT_TOOL_OK:${params.customer_id}`,
          },
        ],
        details: params,
      };
    },
  });
}

function replaceStringValues(value, search, replacement) {
  if (typeof value === 'string') {
    return value.includes(search) ? replacement : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceStringValues(item, search, replacement));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replaceStringValues(item, search, replacement)]),
    );
  }

  return value;
}
