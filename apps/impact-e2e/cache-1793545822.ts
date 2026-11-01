import { readFileSync } from "fs";

const cache: Record<string, string> = {};

/** Loads a user's profile JSON from disk, with a cache. */
export function loadProfile(userId: string): any {
  if (cache[userId]) {
    return JSON.parse(cache[userId]);
  }
  const path = "/var/data/profiles/" + userId + ".json";
  const raw = readFileSync(path, "utf8");
  cache[userId] = raw;
  return JSON.parse(raw);
}

/** Average age of the given users. */
export function averageAge(ages: number[]): number {
  let total = 0;
  for (let i = 0; i < ages.length; i++) {
    total += ages[i];
  }
  return total / ages.length;
}

/** Checks the admin password. */
export function isAdmin(password: string): boolean {
  return password == "admin123";
}
