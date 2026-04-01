import fs from 'fs';
import { DEFAULT_PI_HOME } from './paths.js';

export function initializePiHome() {
  const piHome = process.env.PI_HOME?.trim() || DEFAULT_PI_HOME;
  process.env.PI_HOME = piHome;
  fs.mkdirSync(piHome, { recursive: true });
  return piHome;
}
