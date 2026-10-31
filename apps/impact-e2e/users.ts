import { Pool } from "pg";

const pool = new Pool();

export async function findUser(id: string) {
  const result = await pool.query("select * from users where id = $1", [id]);
  return result.rows[0];
}

export function isExpired(token: { expiresAt?: Date }) {
  if (!token.expiresAt) {
    return true;
  }

  return token.expiresAt.getTime() < Date.now();
}

export function parseClaims(raw: string) {
  const parts = raw.split(".");

  if (parts.length < 2 || !parts[1]) {
    throw new Error("Malformed token: expected JWT with payload segment");
  }

  try {
    const decodedPayload = Buffer.from(parts[1], "base64").toString();
    return JSON.parse(decodedPayload);
  } catch {
    throw new Error("Malformed token claims: unable to decode or parse payload JSON");
  }
}

export async function deleteUser(id: string) {
  await pool.query("delete from users where id = $1", [id]);
}
