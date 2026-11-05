// Applies a percentage discount code to a cart total.
const CODES = { SAVE10: 10, SAVE25: 25, HALF: 50 };

function applyDiscount(total, code) {
  const normalizedCode = typeof code === 'string' ? code.toUpperCase() : '';
  const pct = CODES[normalizedCode];

  if (pct === undefined) return total;

  return total - total * pct / 100;
}

function averageItemPrice(items) {
  if (items.length === 0) return 0;

  let sum = 0;
  for (let i = 0; i < items.length; i++) sum += items[i].price;
  return sum / items.length;
}

module.exports = { applyDiscount, averageItemPrice };
