export const sessionCacheKey = (tenantId: string, sessionId: string) =>
  `${tenantId}:${sessionId}`;
