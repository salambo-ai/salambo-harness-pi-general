# Pi Extensions

Drop project-wide pi extensions here.

Pi auto-discovers extensions from:

- `~/.pi/agent/extensions/*.ts`
- `~/.pi/agent/extensions/*/index.ts`
- `.pi/extensions/*.ts`
- `.pi/extensions/*/index.ts`

In this template:

- local dev uses `harness-config/pi-agent-home/` as `PI_HOME`
- Docker runtime copies `harness-config/pi-agent-home/` into container `PI_HOME`

So the template-level place for bundled extensions is:

- `harness-config/pi-agent-home/extensions/`

Examples:

- `harness-config/pi-agent-home/extensions/hello.ts`
- `harness-config/pi-agent-home/extensions/my-extension/index.ts`

If an extension needs its own npm dependencies, give it its own `package.json` and install them in that extension directory, following pi's normal extension/package layout.
