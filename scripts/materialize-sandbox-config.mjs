import path from 'node:path';
import {
  loadSandboxConfig,
  materializeSandboxConfig,
  writeMaterializedSandboxConfig,
} from './sandbox-config.mjs';

const checkOnly = process.argv.includes('--check');
const positionalArgs = process.argv.slice(2).filter((arg) => arg !== '--check');
const outDir = positionalArgs[0]
  ? path.resolve(process.cwd(), positionalArgs[0])
  : path.resolve(process.cwd(), '.artifacts', 'materialized-sandbox-config');

const sandboxConfig = await loadSandboxConfig();
const materialized = materializeSandboxConfig(sandboxConfig);

if (checkOnly) {
  console.log('[sandbox-config] sandbox/packages.mjs OK');
  process.exit(0);
}

await writeMaterializedSandboxConfig(outDir, materialized);

console.log(`[sandbox-config] Materialized sandbox config to ${outDir}`);
