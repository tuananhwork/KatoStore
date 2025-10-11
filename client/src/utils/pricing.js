// client/src/utils/pricing.js
import { CART } from './constants';

export const calcTotals = (items) => {
  const arr = Array.isArray(items) ? items : [];
  const subtotal = arr.reduce((t, i) => t + (i.price || 0) * (i.quantity || 0), 0);
  const shipping = subtotal > CART.FREE_SHIPPING_THRESHOLD ? 0 : CART.DEFAULT_SHIPPING;
  const tax = Math.round(subtotal * CART.TAX_RATE);
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
};
