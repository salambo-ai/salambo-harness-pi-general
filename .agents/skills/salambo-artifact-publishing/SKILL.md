---
name: salambo-artifact-publishing
description: Help engineers add or use Salambo artifact publishing in an agent template. Use when generated files, reports, exports, attachments, or run artifacts should be stored and shown in Salambo without exposing object-storage credentials.
---

# Salambo Artifact Publishing

Use this skill when an agent should produce user-visible files such as reports, exports, PDFs, CSVs, JSON summaries, or generated assets.

## Product model

Artifacts are explicit. Salambo does not upload every file in the sandbox.

The intended builder-facing contract is:

```text
agent writes file -> hosted tool or platform executable publishes artifact -> Salambo stores file -> run UI/API show it
```

Storage credentials must never be exposed to the sandbox.

## Runtime contract

Salambo should inject artifact publishing details at run time:

```bash
SALAMBO_ARTIFACT_UPLOAD_URL
SALAMBO_ARTIFACT_TOKEN
SALAMBO_OUTPUT_DIR=/workspace/outputs
```

Platform-owned artifact tooling should read these env vars. Do not hardcode provider-specific or internal endpoint names in builder-authored agent code.

## Current implementation direction

The platform already has internal artifact bridge logic. The builder-facing URL should be a stable alias, expected to be injected as:

```text
/api/runtime/artifacts
```

Do not document the Daytona-specific route as the builder contract.

## Builder guidance

- Write generated files under `/workspace`, preferably `/workspace/outputs`.
- Publish only files the user should see, through a hosted extension tool or platform executable.
- Use logical artifact paths like `/report.pdf` or `/reports/summary.json`.
- Do not publish secrets, credentials, raw logs with tokens, or private scratch files.
- For large content, publish a file and summarize it in the response.

## References

- `references/artifact-flow.md`
- `references/helper-api.md`
- `references/security.md`
