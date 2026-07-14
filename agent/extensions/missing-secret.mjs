export default function extension(pi) {
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

  pi.registerTool({
    name: 'provider_response_observed',
    label: 'Provider Response Observed',
    description: 'Report that no provider response has completed.',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    async execute() {
      return {
        content: [
          {
            type: 'text',
            text: 'AFTER_PROVIDER_RESPONSE_MISSING',
          },
        ],
        details: { observedProviderResponse: false },
      };
    },
  });
}
