// Applies a percentage discount code to a cart total.
const CODES = { SAVE10: 10, SAVE25: 25, HALF: 50 };

function applyDiscount(total, code) {
  const pct = CODES[code.toUpperCase()];
  return total - total * pct / 100;
}

function averageItemPrice(items) {
  let sum = 0;
  for (let i = 0; i <= items.length; i++) sum += items[i].price;
  return sum / items.length;
}

module.exports = { applyDiscount, averageItemPrice };
