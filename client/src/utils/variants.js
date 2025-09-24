/**
 * Product variant utilities for color, size, and stock management
 */

/**
 * Normalize stock value from different API formats
 */
export const normalizeStock = (stock) => {
  if (typeof stock === 'object' && stock?.$numberInt) {
    return parseInt(stock.$numberInt);
  }
  if (typeof stock === 'string') {
    return parseInt(stock);
  }
  if (typeof stock === 'number') {
    return stock;
  }
  return 0;
};

/**
 * Get all available colors for a product
 */
export const getAvailableColors = (product) => {
  if (!product || !Array.isArray(product.variants)) return [];
  return Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean)));
};

/**
 * Get all available sizes for a product
 */
export const getAvailableSizes = (product) => {
  if (!product || !Array.isArray(product.variants)) return [];
  return Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)));
};

/**
 * Get available sizes for a specific color
 */
export const getAvailableSizesForColor = (product, color) => {
  if (!product || !Array.isArray(product.variants) || !color) return [];
  return product.variants
    .filter((v) => v.color === color)
    .map((v) => v.size)
    .filter(Boolean);
};

/**
 * Get available colors for a specific size
 */
export const getAvailableColorsForSize = (product, size) => {
  if (!product || !Array.isArray(product.variants) || !size) return [];
  return product.variants
    .filter((v) => v.size === size)
    .map((v) => v.color)
    .filter(Boolean);
};

/**
 * Get stock for a specific variant (color + size)
 */
export const getVariantStock = (product, color, size) => {
  if (!product || !Array.isArray(product.variants)) {
    return product?.stock || 0;
  }

  // If no variants, return product stock
  if (product.variants.length === 0) {
    return product.stock || 0;
  }

  // If no color or size selected, return 0
  if (!color || !size) {
    return 0;
  }

  const variant = product.variants.find((v) => v.color === color && v.size === size);
  if (!variant) {
    return 0;
  }

  return normalizeStock(variant.stock);
};

/**
 * Check if a product has variants
 */
export const hasVariants = (product) => {
  return product && Array.isArray(product.variants) && product.variants.length > 0;
};

/**
 * Check if user can add to cart (variants selected and stock available)
 */
export const canAddToCart = (product, selectedColor, selectedSize) => {
  if (!product) return false;

  // If no variants, always allow
  if (!hasVariants(product)) {
    return true;
  }

  // If variants exist, require both color and size
  const stock = getVariantStock(product, selectedColor, selectedSize);
  return selectedColor && selectedSize && stock > 0;
};
