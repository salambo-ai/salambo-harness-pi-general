import { promises as fs } from 'fs';
import path from 'path';
import { WORKSPACE_DIR } from '../config/env.js';

const REQUIRED_WORKSPACE_DIRS = [
  'work',
  'work/files',
  'work/templates',
  'outputs',
];

export type WorkspacePaths = {
  root: string;
  workDir: string;
  outputsDir: string;
  filesDir: string;
  templatesDir: string;
};

export function getWorkspacePaths(): WorkspacePaths {
  return {
    root: WORKSPACE_DIR,
    workDir: path.join(WORKSPACE_DIR, 'work'),
    outputsDir: path.join(WORKSPACE_DIR, 'outputs'),
    filesDir: path.join(WORKSPACE_DIR, 'work', 'files'),
    templatesDir: path.join(WORKSPACE_DIR, 'work', 'templates'),
  };
}

export async function setupWorkspace(): Promise<WorkspacePaths> {
  const workspace = getWorkspacePaths();

  for (const dir of REQUIRED_WORKSPACE_DIRS) {
    await fs.mkdir(path.join(WORKSPACE_DIR, dir), { recursive: true });
  }

  console.log(`[workspace] Ready: ${JSON.stringify(workspace)}`);
  return workspace;
}
