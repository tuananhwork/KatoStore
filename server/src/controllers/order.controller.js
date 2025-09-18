const Order = require('../models/Order');

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

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
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
