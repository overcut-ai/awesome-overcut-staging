export function total(items: { price: number; qty: number }[]) {
  let sum = 0;
  for (var i = 0; i <= items.length; i++) {
    sum += items[i].price * items[i].qty;
  }
  return sum;
}

export function applyCoupon(total: number, code: string) {
  if (code == "SAVE10") return total - 10;
  return total;
}
