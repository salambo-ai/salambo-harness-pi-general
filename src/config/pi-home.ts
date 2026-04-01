import fs from 'fs';
import os from 'os';
import path from 'path';
import { DEFAULT_PI_HOME } from './paths.js';

function resolveDefaultUserPiHome() {
  return path.join(os.homedir(), '.pi', 'agent');
}

export function initializePiHome() {
  const configuredPiHome = process.env.PI_HOME?.trim() || DEFAULT_PI_HOME;
  const userPiHome = resolveDefaultUserPiHome();

  process.env.PI_HOME = configuredPiHome;
  fs.mkdirSync(configuredPiHome, { recursive: true });

  const localAuthPath = path.join(configuredPiHome, 'auth.json');
  const userAuthPath = path.join(userPiHome, 'auth.json');

  if (
    configuredPiHome !== userPiHome &&
    !fs.existsSync(localAuthPath) &&
    fs.existsSync(userAuthPath)
  ) {
    fs.copyFileSync(userAuthPath, localAuthPath);
    console.log(`[pi] Seeded local auth into ${configuredPiHome}`);
  }

  return configuredPiHome;
}
