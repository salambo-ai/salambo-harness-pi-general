const piSessions = new Map<string, string>();

export function rememberPiSession(sessionId: string, sessionFile?: string) {
  if (!sessionFile) {
    return;
  }

  piSessions.set(sessionId, sessionFile);
}

export function getPiSessionFile(sessionId: string) {
  return piSessions.get(sessionId);
}
