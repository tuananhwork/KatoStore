const Order = require('../models/Order');
const Product = require('../models/Product');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    // customer: only own orders
    if (req.user?.role === 'customer') filter.userId = req.user.sub;

    const items = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Order.countDocuments(filter);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user?.role === 'customer' && String(order.userId) !== String(req.user.sub)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const subtotal = (payload.items || []).reduce((t, i) => t + (i.price || 0) * (i.quantity || 0), 0);
    const shipping = payload.shipping ?? 30000;
    const tax = payload.tax ?? Math.round(subtotal * 0.1);
    const total = subtotal + shipping + tax;

    const order = await Order.create({
      userId: req.user?.sub,
      items: payload.items || [],
      subtotal,
      shipping,
      tax,
      total,
      status: 'pending',
      shippingAddress: payload.shippingAddress || {},
      paymentMethod: payload.paymentMethod || 'cod',
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

async function adjustStockForOrder(order, direction = -1) {
  // direction -1: decrement on shipped, +1: increment on unship/cancel
  for (const item of order.items || []) {
    const product = await Product.findOne({ sku: item.sku });
    if (!product) continue;

    if (item.color && item.size) {
      const variant = product.variants.find((v) => v.color === item.color && v.size === item.size);
      if (variant) {
        const next = (variant.stock || 0) + direction * (item.quantity || 0);
        variant.stock = Math.max(0, next);
      }
    } else {
      const next = (product.stock || 0) + direction * (item.quantity || 0);
      product.stock = Math.max(0, next);
    }

    await product.save();
  }
}

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const prev = order.status;
    order.status = status;

    // Transition to shipped: decrement stock (once)
    if (status === 'shipped' && prev !== 'shipped') {
      await adjustStockForOrder(order, -1);
    }
    // Transition away from shipped (and not delivered): restore stock
    if (prev === 'shipped' && status !== 'shipped' && status !== 'delivered') {
      await adjustStockForOrder(order, +1);
    }

    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user?.role === 'customer' && String(order.userId) !== String(req.user.sub)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (['pending', 'processing'].includes(order.status)) {
      order.status = 'cancelled';
      await order.save();
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};
