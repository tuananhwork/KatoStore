// Utility functions for formatting and text processing

/**
 * Format Vietnamese currency
 */
export const formatVnd = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0);
};

/**
 * Remove Vietnamese diacritics and normalize text
 */
export const normalizeText = (text) => {
  return String(text || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .toLowerCase();
};

/**
 * Normalize SKU for consistent comparison
 */
export const normalizeSku = (sku) => {
  return String(sku || '')
    .trim()
    .toLowerCase();
};

/**
 * Parse API response to extract array data
 */
export const parseApiResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.orders)) return response.orders;
  if (Array.isArray(response?.users)) return response.users;
  return [];
};

/**
 * Calculate pagination info
 */
export const calculatePagination = (total, page, pageSize) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);

  return {
    totalPages,
    currentPage,
    startIdx,
    endIdx,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
};

/**
 * Generate SKU prefix from category
 */
export const getPrefixFromCategory = (category) => {
  if (!category) return 'prd';

  const normalized = normalizeText(category);
  const alphanumeric = normalized.replace(/[^a-z0-9]/g, '');
  return alphanumeric.slice(0, 3) || 'prd';
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Format date to Vietnamese format
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};
