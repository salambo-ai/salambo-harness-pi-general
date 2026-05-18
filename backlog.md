# Backlog

## Hands Sandbox Template Hardening

This template is now hands-only. The Salambo worker owns Pi brain/session/model execution.

### Highest Priority

- validate a deployed smoke run after the slim image change;
- add a Docker smoke test that boots the image and verifies the container stays alive;
- document recommended `agent/settings.json` variants for different models/providers;
- clarify local development flow for hosted extensions without reintroducing an in-sandbox brain.

### Nice To Have

- add release automation/docs polish for the image name;
- add examples for common Python/Node tool stacks in `sandbox-image/packages.mjs`;
- add a small fixture extension for sidecar hook/tool testing.

### Working Principle

For this template, improvements should optimize for:

- worker-owned brain / sandbox-hands separation;
- deterministic image builds;
- clear customization points;
- no hidden platform server in the sandbox.
