# Content Pass-through Guidance

Chat integration input may include the user's current message plus selected metadata/context.
Design agent instructions so the agent can respond with only that context.

## Good assumptions

- The current message is the primary user request.
- Prior thread context may be available, but may be incomplete.
- File/artifact references may need clarification.
- The user may not be looking at the Salambo web app.

## Bad assumptions

- The agent can see the whole Slack channel.
- The agent can inspect private Teams tenant data by default.
- The agent can access files that were not passed in or published.
- The agent should paste long generated outputs into chat.
