export default function extension(pi) {
  pi.on('context', (event) => {
    return {
      messages: [
        ...event.messages,
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Hosted extension context smoke secret: CONTEXT_HOOK_OK. If asked for the hosted extension context smoke secret, answer exactly CONTEXT_HOOK_OK.',
            },
          ],
        },
      ],
    };
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
