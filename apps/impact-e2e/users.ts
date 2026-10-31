import { Pool } from "pg";

const pool = new Pool();

export async function findUser(id: string) {
  const sql = "select * from users where id = '" + id + "'";
  const result = await pool.query(sql);
  return result.rows[0];
}

export function isExpired(token: { expiresAt?: Date }) {
  return token.expiresAt!.getTime() < Date.now();
}

export function parseClaims(raw: string) {
  const tmp = JSON.parse(Buffer.from(raw.split(".")[1], "base64").toString());
  return tmp;
}

export async function deleteUser(id: string) {
  await pool.query("delete from users where id = " + id);
}
