import cartAPI from '../api/cartAPI';

function hasToken() {
  if (typeof window === 'undefined') return false;
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

export async function getCart() {
  try {
    if (!hasToken()) return [];
    const data = await cartAPI.getMine();
    const items = Array.isArray(data?.items) ? data.items : [];
    // Normalize to include key used by UI
    return items.map((i) => ({
      ...i,
      key: `${i.sku}-${i.color || ''}-${i.size || ''}`,
    }));
  } catch {
    return [];
  }
}

export async function setCart(items) {
  try {
    if (!hasToken()) return [];
    const normalized = (items || []).map((i) => ({
      sku: i.sku,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
      color: i.color,
      size: i.size,
    }));
    const data = await cartAPI.replace(normalized);
    const result = Array.isArray(data?.items) ? data.items : [];
    window.dispatchEvent(new StorageEvent('storage', { key: 'cart:remote' }));
    return result.map((i) => ({ ...i, key: `${i.sku}-${i.color || ''}-${i.size || ''}` }));
  } catch {
    return [];
  }
}

export async function addToCart(product, options = {}) {
  if (!hasToken()) return [];
  const { sku } = product;
  const { quantity = 1, color = undefined, size = undefined } = options;
  const data = await cartAPI.addOrUpdateItem({ sku, quantity, color, size });
  window.dispatchEvent(new StorageEvent('storage', { key: 'cart:remote' }));
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map((i) => ({ ...i, key: `${i.sku}-${i.color || ''}-${i.size || ''}` }));
}

export async function updateCartItem(key, quantity) {
  if (!hasToken()) return [];
  const data = await cartAPI.updateQuantity(key, quantity);
  window.dispatchEvent(new StorageEvent('storage', { key: 'cart:remote' }));
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map((i) => ({ ...i, key: `${i.sku}-${i.color || ''}-${i.size || ''}` }));
}

export async function removeCartItem(key) {
  if (!hasToken()) return [];
  const data = await cartAPI.removeItem(key);
  window.dispatchEvent(new StorageEvent('storage', { key: 'cart:remote' }));
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map((i) => ({ ...i, key: `${i.sku}-${i.color || ''}-${i.size || ''}` }));
}

export async function clearCart() {
  if (!hasToken()) return [];
  const data = await cartAPI.clear();
  window.dispatchEvent(new StorageEvent('storage', { key: 'cart:remote' }));
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map((i) => ({ ...i, key: `${i.sku}-${i.color || ''}-${i.size || ''}` }));
}
