let observedProviderResponse = false;

export default function extension(pi) {
  pi.on('before_agent_start', async (event) => {
    if (event.prompt.includes('MODEL_SELECT_SMOKE')) {
      await pi.setModel({ provider: 'openai', id: 'gpt-5.4-mini', thinkingLevel: 'low' });

      return {
        message: {
          customType: 'hosted-model-select-smoke',
          content: [{ type: 'text', text: 'Answer exactly MODEL_SELECT_OK and do not call tools.' }],
          display: 'hidden',
        },
      };
    }

    if (!event.prompt.includes('BEFORE_AGENT_START_SMOKE')) {
      return undefined;
    }

    return {
      message: {
        customType: 'hosted-before-agent-start-smoke',
        content: [{ type: 'text', text: 'Answer exactly BEFORE_AGENT_START_OK and do not call tools.' }],
        display: 'hidden',
      },
      systemPrompt: `${event.systemPrompt}\nWhen the user asks BEFORE_AGENT_START_SMOKE, answer exactly BEFORE_AGENT_START_OK and do not call tools.`,
    };
  });

  pi.on('context', (event) => {
    const lastMessageText = readLastUserMessageText(event.messages);
    if (!lastMessageText.includes('What is the hosted extension context smoke secret?')) {
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
    if (event.toolName === 'bash' && event.input?.command === 'printf RESULT_REWRITE_ME') {
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

  pi.on('after_provider_response', (event) => {
    if (event.status >= 200 && event.status < 300) {
      observedProviderResponse = true;
    }
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

  pi.registerTool({
    name: 'provider_response_observed',
    label: 'Provider Response Observed',
    description: 'Return whether the hosted extension observed a provider response.',
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
            text: observedProviderResponse ? 'AFTER_PROVIDER_RESPONSE_OK' : 'AFTER_PROVIDER_RESPONSE_MISSING',
          },
        ],
        details: { observedProviderResponse },
      };
    },
  });
}

function readLastUserMessageText(messages) {
  const lastUserMessage = [...(messages ?? [])].reverse().find((message) => message?.role === 'user');
  const content = lastUserMessage?.content;
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .filter((item) => item?.type === 'text' && typeof item.text === 'string')
    .map((item) => item.text)
    .join('\n');
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
