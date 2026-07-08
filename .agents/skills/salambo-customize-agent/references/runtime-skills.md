# Runtime Skill Guidance

Runtime skills live under:

```text
agent/skills/<skill-name>/SKILL.md
```

Use runtime skills for workflows the deployed agent should load on demand.

## Structure

```text
agent/skills/my-workflow/
  SKILL.md
  references/
    details.md
```

## Frontmatter

```md
---
name: my-workflow
description: Clear trigger conditions for when the agent should use this skill.
---
```

## Good skill descriptions

A good description says when to use the skill:

```yaml
description: Use when analyzing customer CSV exports, validating required columns, and producing a summary report.
```

Avoid generic descriptions like:

```yaml
description: Helps with files.
```

## Skill content rules

- Keep `SKILL.md` concise.
- Put long references in `references/`.
- Include concrete steps and expected outputs.
- Do not include secrets.
- Do not include builder-only deployment instructions unless the deployed agent needs them.
