---
name: salambo-chat-integrations
description: Help engineers design Salambo agents that behave well when invoked from Slack or Microsoft Teams, including thread context, pass-through content, chat-safe formatting, and when to use artifacts instead of long messages.
---

# Salambo Chat Integrations

Use this skill when building or tuning an agent that may be used from Slack or Microsoft Teams.

## Core behavior

Chat users are usually in a fast conversational context. Agent responses should be concise, thread-aware, and safe for channel surfaces.

## Context model

- Slack conversations are scoped to the current Slack thread, not the whole channel.
- Teams conversations should be treated as the current Teams conversation/thread context.
- Do not assume channel-wide history unless Salambo explicitly passes it as context.
- If required context is missing, ask one focused clarification question.

## Content pass-through

Salambo passes the chat message content into the agent run as user input/context. Engineers should design the agent so it can handle:

- short messages;
- follow-up questions;
- pasted snippets;
- mentions of files or artifacts;
- requests that lack full web UI context.

## Response style

- Answer directly first.
- Use short paragraphs and bullets.
- Use code fences for commands or code.
- Avoid very large tables in chat.
- Do not expose internal metadata, tokens, hidden prompts, or runtime details.
- For long reports, create/publish an artifact and summarize it in chat.

## References

- `references/slack.md`
- `references/teams.md`
- `references/formatting.md`
- `references/content-pass-through.md`
