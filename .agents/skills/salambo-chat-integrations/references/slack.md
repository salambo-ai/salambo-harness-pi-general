# Slack Agent Design

## Thread behavior

Salambo's Slack behavior should be treated as one conversation chain per Slack thread.
A new thread is a separate context unless Salambo explicitly provides prior context.

## Engineering implications

- Do not design prompts that assume the whole Slack channel history is available.
- Prefer answers that fit inside a thread reply.
- Ask for missing identifiers, files, or decisions instead of guessing from channel context.
- Mention generated artifacts by name/path when a response creates files.

## Good Slack responses

- concise status update;
- short answer with next step;
- artifact summary with filename;
- one clarifying question when blocked.
