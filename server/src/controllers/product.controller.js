const Product = require('../models/Product');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, q } = req.query;
    const filter = { isActive: { $ne: false } }; // Only show active by default
    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };

    const items = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Product.countDocuments(filter);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

exports.adminList = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q = '', category, isActive } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (q) filter.$text = { $search: String(q) };
    if (typeof isActive !== 'undefined') {
      filter.isActive = String(isActive) === 'true';
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Product.countDocuments(filter);

    res.json({
      items: products,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    next(err);
  }
};

exports.getBySku = async (req, res, next) => {
  try {
    const { sku } = req.params;
    const product = await Product.findOne({ sku: sku.toLowerCase() });
    if (!product || product.isActive === false) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const payload = req.body || {};
    payload.sku = String(payload.sku).toLowerCase();
    const existed = await Product.findOne({ sku: payload.sku });
    if (existed) return res.status(409).json({ message: 'SKU already exists' });

    // Normalize variants
    if (Array.isArray(payload.variants)) {
      payload.variants = payload.variants.map((v) => ({
        color: v.color || undefined,
        size: v.size || undefined,
        stock: Number(v.stock || 0),
      }));
      const variantTotal = payload.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
      if (variantTotal > 0) payload.stock = variantTotal; // Derive stock from variants
    }

    // Ensure numeric fields
    if (payload.price != null) payload.price = Number(payload.price) || 0;
    if (payload.originalPrice != null) payload.originalPrice = Number(payload.originalPrice) || 0;
    if (payload.discount != null) payload.discount = Number(payload.discount) || 0;
    if (payload.stock != null) payload.stock = Number(payload.stock) || 0;

    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { sku } = req.params;
    const payload = req.body || {};
    if (payload.sku) delete payload.sku;

    // Normalize variants if provided
    let variantTotal = null;
    if (Array.isArray(payload.variants)) {
      payload.variants = payload.variants.map((v) => ({
        color: v.color || undefined,
        size: v.size || undefined,
        stock: Number(v.stock || 0),
      }));
      variantTotal = payload.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
    }

    // Ensure numeric fields
    if (payload.price != null) payload.price = Number(payload.price) || 0;
    if (payload.originalPrice != null) payload.originalPrice = Number(payload.originalPrice) || 0;
    if (payload.discount != null) payload.discount = Number(payload.discount) || 0;

    // If variants provided and total > 0, override stock by sum of variants
    if (variantTotal != null && variantTotal > 0) {
      payload.stock = variantTotal;
    } else if (payload.stock != null) {
      payload.stock = Number(payload.stock) || 0;
    }

    const product = await Product.findOneAndUpdate({ sku: sku.toLowerCase() }, payload, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { sku } = req.params;
    const product = await Product.findOneAndDelete({ sku: sku.toLowerCase() });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

exports.toggleVisibility = async (req, res, next) => {
  try {
    const { sku } = req.params;
    const product = await Product.findOne({ sku: sku.toLowerCase() });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.isActive = !product.isActive;
    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
};
