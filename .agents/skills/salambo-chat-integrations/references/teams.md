# Microsoft Teams Agent Design

Treat the active Teams conversation as the available context.

## Engineering implications

- Keep responses readable in Teams.
- Avoid relying on Salambo web UI concepts unless the prompt asks for them.
- Use plain Markdown-compatible formatting.
- Prefer artifacts for long generated outputs.
- Ask for missing context instead of assuming access to tenant/channel history.
