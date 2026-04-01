type PiSessionRecord = {
  sessionFile?: string;
  updatedAt: string;
};

const piSessions = new Map<string, PiSessionRecord>();

export function rememberPiSession(sessionId: string, sessionFile?: string) {
  piSessions.set(sessionId, {
    sessionFile,
    updatedAt: new Date().toISOString(),
  });
}

export function getPiSessionFile(sessionId: string) {
  return piSessions.get(sessionId)?.sessionFile;
}

export function getPiSessionRegistrySnapshot() {
  return Array.from(piSessions.entries()).map(([sessionId, record]) => ({
    sessionId,
    ...record,
  }));
}
