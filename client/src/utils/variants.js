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
  if (!product) {
    return 0;
  }
  if (!Array.isArray(product.variants)) {
    return normalizeStock(product?.stock);
  }

  // If no variants, return product stock
  if (product.variants.length === 0) {
    return normalizeStock(product.stock);
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
 * Total stock (sum of variants if present; otherwise product.stock)
 */
export const getTotalStock = (product) => {
  if (!product) return 0;
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + normalizeStock(v.stock), 0);
  }
  return normalizeStock(product.stock);
};

/**
 * Filter colors by selected size while only keeping variants with stock > 0
 */
export const filterColorsBySize = (product, size) => {
  if (!product) return [];
  const allColors = getAvailableColors(product);
  if (!size) return allColors;
  const allowed = new Set(
    (product.variants || [])
      .filter((v) => v.size === size && normalizeStock(v.stock) > 0 && !!v.color)
      .map((v) => v.color)
  );
  return allColors.filter((c) => allowed.has(c));
};

/**
 * Filter sizes by selected color while only keeping variants with stock > 0
 */
export const filterSizesByColor = (product, color) => {
  if (!product) return [];
  const allSizes = getAvailableSizes(product);
  if (!color) return allSizes;
  const allowed = new Set(
    (product.variants || [])
      .filter((v) => v.color === color && normalizeStock(v.stock) > 0 && !!v.size)
      .map((v) => v.size)
  );
  return allSizes.filter((s) => allowed.has(s));
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
