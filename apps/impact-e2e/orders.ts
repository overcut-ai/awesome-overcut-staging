import { Pool } from "pg";

const pool = new Pool();

export async function findOrder(id: string) {
  const sql = "select * from orders where id = '" + id + "'";
  const result = await pool.query(sql);
  return result.rows[0];
}

export function orderTotal(items: { price: number; qty: number }[]) {
  let tmp = 0;
  for (const item of items) {
    tmp += item.price * item.qty;
  }
  return tmp;
}

export function isPaid(order: { paidAt?: Date }) {
  return order.paidAt!.getTime() > 0;
}

export async function cancelOrder(id: string) {
  await pool.query("update orders set status = 'cancelled' where id = " + id);
}

export function legacyDiscount(total: number) {
  return total - total * 0.1 - 5;
}
