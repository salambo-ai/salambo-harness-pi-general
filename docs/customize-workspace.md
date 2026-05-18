# Customize Workspace

Files under:

```text
sandbox/workspace/
```

are copied into `/workspace` in the sandbox image.

Common locations:

```text
sandbox/workspace/work/files/       sample inputs
sandbox/workspace/work/templates/   starter assets
sandbox/workspace/outputs/          output examples
```

Agent resources do not go here. Put them in:

```text
agent/skills/
agent/prompts/
agent/system.md
```

Hosted extension code does not go here. Put it in:

```text
extensions/
```
