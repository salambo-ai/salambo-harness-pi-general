# Artifact Publishing Interface

Do not put Salambo platform helper code in `sandbox/workspace/`.

`/workspace` is the agent/customer hands area. It should contain user work files, starter inputs, templates, and generated outputs. Platform artifact publishing logic should live outside the workspace.

## Preferred interfaces

Expose artifact publishing to the agent through one of these platform-owned surfaces:

| Interface | Where it lives | Who uses it |
| --- | --- | --- |
| Hosted extension tool | `agent/extensions/` plus platform-injected env | The model calls a tool such as `publish_artifact`. |
| Platform executable | Baked runtime path such as `/opt/salambo/bin/salambo-artifact` | Shell/tooling calls an executable. |
| Runtime package | Platform-owned package such as future `@salambo/runtime` | Extension/runtime code imports a stable helper. |

The first builder-facing implementation should likely be a hosted extension tool or platform executable, not a helper copied into `/workspace`.

## Hosted extension tool shape

Target model-facing tool:

```text
publish_artifact(file_path, artifact_path, content_type?)
```

Example extension usage internally:

```js
pi.registerTool({
  name: 'publish_artifact',
  label: 'Publish Artifact',
  description: 'Publish a generated workspace file as a Salambo run artifact.',
  parameters: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: 'Path to the local file in the sandbox, usually under /workspace/outputs.'
      },
      artifact_path: {
        type: 'string',
        description: 'User-visible artifact path, such as /reports/report.pdf.'
      },
      content_type: {
        type: 'string',
        description: 'Optional MIME type.'
      }
    },
    required: ['file_path', 'artifact_path'],
    additionalProperties: false
  },
  async execute(_toolCallId, params) {
    // Read injected env vars and publish through Salambo's artifact bridge.
  }
});
```

The extension/executable should:

- read `SALAMBO_ARTIFACT_UPLOAD_URL`;
- read `SALAMBO_ARTIFACT_TOKEN`;
- read the file from disk;
- send the file with `Authorization: Bearer <token>`;
- set `x-display-path`, `x-file-name`, and `content-type`;
- throw a clear error if artifact publishing is unavailable.

## Future package shape

A later platform package could expose:

```ts
import { artifacts } from '@salambo/runtime';

await artifacts.upload('/workspace/outputs/report.pdf', {
  path: '/reports/report.pdf',
  contentType: 'application/pdf',
});
```

That package should be provided by the Salambo runtime/base image or installed as a runtime dependency for extension code. It should still use the injected env contract internally.

## Rule

Builder-authored agent code may create files in `/workspace`. Salambo-owned artifact publishing code should not be seeded into `/workspace` as ordinary user work files.
