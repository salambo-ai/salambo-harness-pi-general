import path from 'node:path';
import {
  loadImageConfig,
  materializeImageConfig,
  writeMaterializedImageConfig,
} from './image-config.mjs';

const checkOnly = process.argv.includes('--check');
const positionalArgs = process.argv.slice(2).filter((arg) => arg !== '--check');
const outDir = positionalArgs[0]
  ? path.resolve(process.cwd(), positionalArgs[0])
  : path.resolve(process.cwd(), '.artifacts', 'materialized-image-config');

const imageConfig = await loadImageConfig();
const materialized = materializeImageConfig(imageConfig);

if (checkOnly) {
  console.log('[sandbox-config] sandbox-image/packages.mjs OK');
  process.exit(0);
}

await writeMaterializedImageConfig(outDir, materialized);

console.log(`[sandbox-config] Materialized image config to ${outDir}`);
