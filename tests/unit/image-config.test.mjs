import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  assertValidImageConfig,
  loadImageConfig,
  materializeImageConfig,
} from '../../scripts/image-config.mjs';

test('loads the hands-only image config', async () => {
  const config = await loadImageConfig();

  assert.ok(config.apt.includes('python3'));
  assert.ok(config.pip.includes('pandas==2.2.3'));
  assert.deepEqual(config.npm, []);
});

test('materializes apt, npm, pip, and bootstrap files', () => {
  const materialized = materializeImageConfig({
    apt: ['git', 'curl'],
    npm: [],
    pip: ['pandas==2.2.3'],
    setup: 'echo setup-ok',
  });

  assert.equal(materialized.aptPackagesText, 'git\ncurl\n');
  assert.equal(materialized.npmToolsText, '');
  assert.equal(materialized.pythonRequirementsText, 'pandas==2.2.3\n');
  assert.equal(materialized.bootstrapScriptText, '#!/bin/sh\nset -eu\n\necho setup-ok\n');
});

test('rejects invalid image config shapes', () => {
  assert.throws(
    () => assertValidImageConfig({ apt: ['git'], npm: [42], pip: [], setup: '' }),
    /npm\[0\] must be a string/,
  );
});

test('loadImageConfig validates sandbox-image/packages.mjs', async () => {
  const rootDir = await mkdtemp(path.join(tmpdir(), 'salambo-image-config-'));

  try {
    await mkdirp(path.join(rootDir, 'sandbox-image'));
    await writeFile(
      path.join(rootDir, 'sandbox-image', 'packages.mjs'),
      'export default { apt: [], npm: [], pip: [], setup: "" };\n',
      'utf8',
    );

    const config = await loadImageConfig(rootDir);
    assert.deepEqual(config, { apt: [], npm: [], pip: [], setup: '' });
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

async function mkdirp(dir) {
  await import('node:fs/promises').then(({ mkdir }) => mkdir(dir, { recursive: true }));
}
