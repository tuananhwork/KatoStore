// Simple cart utilities using localStorage
const STORAGE_KEY = 'cart:';

function getUserKey() {
  try {
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : null;
    return STORAGE_KEY + (user?._id || user?.id || 'guest');
  } catch {
    return STORAGE_KEY + 'guest';
  }
}

export function getCart() {
  try {
    const key = getUserKey();
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setCart(items) {
  try {
    const key = getUserKey();
    localStorage.setItem(key, JSON.stringify(items || []));
    window.dispatchEvent(new StorageEvent('storage', { key }));
  } catch {
    // ignore
  }
}

export function addToCart(product, options = {}) {
  const { sku, name, price, media, stock } = product;
  const { quantity = 1, color = undefined, size = undefined } = options;
  const items = getCart();
  const image = media && media.length > 0 ? media[0].url : '';
  const key = `${sku}-${color || ''}-${size || ''}`;
  const index = items.findIndex((i) => i.key === key);
  if (index >= 0) {
    const newQty = Math.min((items[index].quantity || 0) + quantity, stock || 9999);
    items[index] = { ...items[index], quantity: newQty };
  } else {
    items.push({
      key,
      sku,
      name,
      price,
      image,
      quantity: Math.min(quantity, stock || 9999),
      color,
      size,
      stock: stock || 0,
    });
  }
  setCart(items);
  return items;
}

export function updateCartItem(key, quantity) {
  const items = getCart();
  const index = items.findIndex((i) => i.key === key);
  if (index >= 0) {
    if (quantity <= 0) {
      items.splice(index, 1);
    } else {
      items[index] = { ...items[index], quantity };
    }
    setCart(items);
  }
  return items;
}

export function removeCartItem(key) {
  const items = getCart().filter((i) => i.key !== key);
  setCart(items);
  return items;
}

export function clearCart() {
  setCart([]);
}
