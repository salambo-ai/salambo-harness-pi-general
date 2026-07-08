---
name: salambo-customize-agent
description: Help engineers customize the deployed agent's behavior in a Salambo template repo, including system prompt, Pi settings, runtime skills, prompt templates, and behavior tests. Use when editing what the agent says or how it decides what to do.
---

# Customize a Salambo Agent

Use this skill when changing the deployed agent's behavior.

## Start with the intent

Before editing files, identify the change type:

| Goal | Edit |
| --- | --- |
| Change role, boundaries, tone, escalation rules | `agent/system.md` |
| Change model or enabled tools | `agent/settings.json` |
| Add a reusable workflow the deployed agent should load on demand | `agent/skills/<name>/SKILL.md` |
| Add reusable prompt text | `agent/prompts/` |
| Add a real tool/action | `agent/extensions/*.mjs` |
| Add dependency needed by tools or workspace code | `sandbox/packages.mjs` or `sandbox/Dockerfile` |

## Rules for good agent customization

- Keep `agent/system.md` short enough to audit.
- Put specialized workflows in runtime skills instead of one giant system prompt.
- Keep runtime skills user/task-focused, not implementation-history-focused.
- Do not put secrets, tokens, or customer data in prompts, settings, or skills.
- Prefer explicit behavior rules over vague personality language.
- Add examples only when they reduce ambiguity.

## Runtime skills vs macro skills

Runtime skills belong in:

```text
agent/skills/
```

Builder macro skills belong in:

```text
.agents/skills/
```

If the deployed agent should use the instructions, put them under `agent/skills/`.
If an engineer/coding assistant should use the instructions while editing this repo, put them under `.agents/skills/`.

## References

- `references/system-prompt.md`
- `references/settings.md`
- `references/runtime-skills.md`
- `references/prompts.md`
