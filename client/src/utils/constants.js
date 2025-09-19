// Application constants

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CUSTOMER: 'customer',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
  [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
  [ORDER_STATUS.PROCESSING]: 'Đang xử lý',
  [ORDER_STATUS.SHIPPED]: 'Đang giao',
  [ORDER_STATUS.DELIVERED]: 'Đã giao',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
};

export const PRODUCT_CATEGORIES = {
  TOPS: 'Tops',
  PANTS: 'Pants',
  SHOES: 'Shoes',
  BOOTS: 'Boots',
  SANDALS: 'Sandals',
  SLIDES: 'Slides',
  SKIRTS: 'Skirts',
  OUTERWEAR: 'Outerwear',
};

export const CATEGORY_PREFIXES = {
  [PRODUCT_CATEGORIES.TOPS]: 'top',
  [PRODUCT_CATEGORIES.PANTS]: 'pan',
  [PRODUCT_CATEGORIES.SHOES]: 'sho',
  [PRODUCT_CATEGORIES.BOOTS]: 'bot',
  [PRODUCT_CATEGORIES.SANDALS]: 'san',
  [PRODUCT_CATEGORIES.SLIDES]: 'sli',
  [PRODUCT_CATEGORIES.SKIRTS]: 'ski',
  [PRODUCT_CATEGORIES.OUTERWEAR]: 'out',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
};

export const CART = {
  FREE_SHIPPING_THRESHOLD: 2000000, // 2M VND
  DEFAULT_SHIPPING: 30000, // 30K VND
  TAX_RATE: 0.1, // 10%
};

export const MEDIA = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  MAX_IMAGES: 10,
  MAX_VIDEOS: 5,
};

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9]{10,11}$/,
  SKU_REGEX: /^[a-z]{3}-[0-9]{4}$/,
  PASSWORD_MIN_LENGTH: 6,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    UPDATE: '/products',
    DELETE: '/products',
    ADMIN_LIST: '/admin/products',
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE: '/orders',
    ADMIN_LIST: '/admin/orders',
  },
  USERS: {
    LIST: '/admin/users',
    UPDATE: '/admin/users',
  },
  MEDIA: {
    UPLOAD_SINGLE: '/media/upload/single',
    UPLOAD_MULTIPLE: '/media/upload/multiple',
  },
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CART_PREFIX: 'cart:',
};
