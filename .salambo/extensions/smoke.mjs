export default function extension(pi) {
  pi.on('tool_call', (event) => {
    if (event.toolName === 'bash' && event.input?.command?.includes('HOOK_BLOCK_ME')) {
      return { block: true, reason: 'HOOK_BLOCK_OK' };
    }

    return { block: false };
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
