import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadImageConfig(rootDir = process.cwd()) {
  const modulePath = path.join(rootDir, 'harness-config', 'docker.mjs');
  const module = await import(pathToFileURL(modulePath).href);
  const config = module.default;
  assertValidImageConfig(config);
  return config;
}

export function assertValidImageConfig(config) {
  const errors = [];

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('harness-config/docker.mjs must export an object');
  }

  validateStringArray(config.apt, 'apt', errors);
  validateStringArray(config.npm, 'npm', errors);
  validateStringArray(config.pip, 'pip', errors);

  if (typeof config.setup !== 'string') {
    errors.push('setup must be a string');
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
}

export function materializeImageConfig(config) {
  return {
    aptPackagesText: renderListFile(config.apt),
    npmToolsText: renderListFile(config.npm),
    pythonRequirementsText: renderListFile(config.pip),
    bootstrapScriptText: renderBootstrapScript(config.setup),
  };
}

export async function writeMaterializedImageConfig(outDir, config) {
  await mkdir(outDir, { recursive: true });

  await Promise.all([
    writeFile(path.join(outDir, 'apt-packages.txt'), config.aptPackagesText, 'utf8'),
    writeFile(path.join(outDir, 'npm-tools.txt'), config.npmToolsText, 'utf8'),
    writeFile(path.join(outDir, 'requirements.txt'), config.pythonRequirementsText, 'utf8'),
    writeFile(path.join(outDir, 'bootstrap.sh'), config.bootstrapScriptText, 'utf8'),
  ]);
}

function validateStringArray(value, field, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${field} must be an array of strings`);
    return;
  }

  for (const [index, entry] of value.entries()) {
    if (typeof entry !== 'string') {
      errors.push(`${field}[${index}] must be a string`);
    }
  }
}

function renderListFile(entries) {
  return entries.length > 0 ? `${entries.join('\n')}\n` : '';
}

function renderBootstrapScript(setup) {
  const header = '#!/bin/sh\nset -eu\n';
  const body = setup.trim();

  return body ? `${header}\n${body}\n` : header;
}

