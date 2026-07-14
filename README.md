# Salambo Pi General

Minimal Salambo template for a worker-owned Pi agent.

```text
Salambo worker = brain, model loop, run lifecycle
this repo      = agent config + sandbox image inputs
```

## File map

```text
agent/
  settings.json        Model and active tools.
  system.md            Base system prompt.
  skills/              Pi skills.
  prompts/             Pi prompt templates.
  extensions/          Hosted extension code.

sandbox/
  Dockerfile           Builds the Daytona sandbox image.
  packages.mjs         apt/npm/pip packages and setup script.
  workspace/           Files copied into /workspace.
  entrypoint.sh        Keeps the sandbox container alive.

salambo.yaml           Deploy config.
.env.example           Local deploy/smoke env example.
```

Rule:

```text
Agent behavior goes in agent/.
Machine setup goes in sandbox/.
Builder macro guidance goes in .agents/skills/.
```

There is intentionally no app server, no `/agent/query`, and no Pi brain in this repo.

## Builder macro skills

This repo includes project-local macro skills for engineers and coding assistants under:

```text
.agents/skills/
```

These are not runtime skills for the deployed agent. They explain how to customize this template repo.

Use them when editing the template:

- `salambo-template-overview` for repo structure and file ownership.
- `salambo-customize-agent` for system prompt, settings, runtime skills, and prompts.
- `salambo-sandbox-customization` for dependencies, Docker, and workspace files.
- `salambo-extensions` for custom hosted tools.
- `salambo-artifact-publishing` for generated files and run artifacts.
- `salambo-chat-integrations` for Slack/Teams behavior and chat-safe responses.

## Configure the agent

### 1. Choose the model and active tools

Edit:

```text
agent/settings.json
```

Example:

```json
{
  "model": {
    "provider": "openai",
    "model": "gpt-5.2",
    "thinkingLevel": "low"
  },
  "tools": ["bash", "lookup_customer"]
}
```

Built-in tools such as `bash` are provided by the Salambo worker. Extension tools must be registered by files in `agent/extensions/` and listed here if you want them active.

### 2. Set the base system prompt

Edit:

```text
agent/system.md
```

### 3. Add skills

Add Pi skills under:

```text
agent/skills/<skill-name>/SKILL.md
```

The Salambo CLI compiles these into the deployment manifest and the Dockerfile also copies them to:

```text
/workspace/.salambo/agent/skills
```

### 4. Add prompt templates

Add prompt templates under:

```text
agent/prompts/
```

They are copied to:

```text
/workspace/.salambo/agent/prompts
```

### 5. Add hosted extensions

Put extension modules in:

```text
agent/extensions/
```

Then declare them in `salambo.yaml`:

```yaml
extensions:
  - path: agent/extensions/smoke.mjs
    mode: auto
```

The staging fixture also exposes bounded prompt markers for advanced QA:
`THINKING_LEVEL_SMOKE:minimal`, `THINKING_LEVEL_SMOKE:xhigh`, and
`THINKING_LEVEL_SMOKE:max`. Each marker selects the same OpenAI model with the
requested Pi thinking level and returns `THINKING_LEVEL_OK:<level>`. These
controls run inside the sandbox extension; they do not add a customer-facing
platform endpoint or execute fixture code in the worker process.

`DURABLE_RUNTIME_STATE_SMOKE` is the bounded two-turn SAL-199 fixture. On the
marked first turn only, it selects OpenAI `gpt-5.4-mini` with `xhigh` thinking
and makes `lookup_customer` the sole active tool. A follow-up prompt must omit
the marker; this proves a fresh worker restored the native Pi session state
instead of asking the extension to reapply it.

`salambo.missing-secret.yaml` defines a separate staging-only agent with the
same runtime but no provider secret. Deploy it with `--file
salambo.missing-secret.yaml` to verify the bounded missing-auth failure without
removing or changing credentials on the shared smoke agent. Its extension only
registers the tools declared by the shared settings; it has no lifecycle hooks
or model mutations, so the failure remains a pure provider-auth scenario.

Extensions run in the sandbox sidecar, not in the worker.

Use `.mjs` because this template has no `package.json`; `.mjs` tells Node the file is an ES module.

## Configure the sandbox machine

### Install packages

Edit:

```text
sandbox/packages.mjs
```

```js
export default {
  apt: ['git', 'python3'],
  npm: [],
  pip: ['pandas==2.2.3'],
  setup: '',
};
```

### Seed workspace files

Files in:

```text
sandbox/workspace/
```

are copied into:

```text
/workspace
```

Use this for starter files, sample inputs, templates, or expected output folders.

## Configure deploy settings

Edit:

```text
salambo.yaml
```

Most commonly changed fields:

```yaml
name: my-agent

agent:
  name: My Agent
  slug: my-agent
  description: What this agent does.

runtimeConfig:
  egressPolicyMode: restricted
  egressAllowlist:
    - api.openai.com

secrets:
  OPENAI_API_KEY:
    fromEnv: OPENAI_API_KEY
    exposeTo:
      - runtime
```

`image.repository` is still present because the current `salambo.yaml` v1 schema requires it. Hosted source deploys build into Salambo-managed Depot registry; you do not publish this image yourself.

## Local checks

```bash
node --check agent/extensions/smoke.mjs
node --input-type=module -e "const c=(await import('./sandbox/packages.mjs')).default; for (const k of ['apt','npm','pip']) if (!Array.isArray(c[k]) || c[k].some((x)=>typeof x !== 'string')) throw new Error(k); if (typeof c.setup !== 'string') throw new Error('setup'); console.log('sandbox/packages.mjs OK')"
```

If you have access to the private base image registry:

```bash
docker build -f sandbox/Dockerfile .
```

## Deploy

Set env vars from `.env.example`, then run:

```bash
node /path/to/salambo_app/packages/cli/build/index.js deploy \
  --profile default \
  --source . \
  --config salambo.yaml \
  --commit "$(git rev-parse HEAD)"
```

`salambo deploy --source .` uploads this repo plus the compiled Pi manifest. Salambo builds the image, creates the Daytona snapshot, and activates the deployment.

## Runtime paths

Inside the sandbox:

```text
/workspace                         working directory
/workspace/.salambo/agent/skills   skill files
/workspace/.salambo/agent/prompts  prompt templates
/workspace/agent/extensions        hosted extension modules
/opt/salambo                       baked Salambo runtime from the base image
/run/salambo                       per-run writable platform state
```
