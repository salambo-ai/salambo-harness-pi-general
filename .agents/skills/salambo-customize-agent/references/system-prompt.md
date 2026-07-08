# System Prompt Guidance

Edit:

```text
agent/system.md
```

Use the system prompt for durable behavior rules:

- who the agent is;
- what the agent should optimize for;
- what it must never do;
- how it should handle uncertainty;
- when it should ask clarification questions;
- domain-specific constraints.

## Good pattern

```md
You are a customer support analyst for Acme.

Rules:
- Answer from the provided support docs when possible.
- Ask one clarifying question when the account, product, or error is unclear.
- Do not invent refund, legal, or security policy.
- Escalate billing disputes to a human.
```

## Avoid

- Long policy dumps that no one can audit.
- Secrets or credentials.
- References to local developer paths.
- Instructions that conflict with runtime skills or extension behavior.
