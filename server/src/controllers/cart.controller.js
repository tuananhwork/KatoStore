const Cart = require('../models/Cart');
const Product = require('../models/Product');

function buildKey(item) {
  return `${item.sku}-${item.color || ''}-${item.size || ''}`;
}

exports.getMine = async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const cart = await Cart.findOne({ userId });
    res.json(cart || { userId, items: [] });
  } catch (err) {
    next(err);
  }
};

exports.replace = async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const payloadItems = Array.isArray(req.body?.items) ? req.body.items : [];
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: payloadItems } },
      { upsert: true, new: true }
    );
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

exports.addOrUpdateItem = async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const { sku, quantity = 1, color, size } = req.body || {};
    if (!sku) return res.status(400).json({ message: 'sku is required' });
    const product = await Product.findOne({ sku: String(sku).toLowerCase() });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const price = product.price;
    const image = Array.isArray(product.media) && product.media.length > 0 ? product.media[0].url : '';

    const cart = (await Cart.findOne({ userId })) || (await Cart.create({ userId, items: [] }));

    const items = cart.items || [];
    const key = `${sku}-${color || ''}-${size || ''}`;
    const idx = items.findIndex((i) => `${i.sku}-${i.color || ''}-${i.size || ''}` === key);
    if (idx >= 0) {
      const current = Number(items[idx].quantity || 0);
      const add = Math.max(1, Number(quantity || 1));
      items[idx].quantity = current + add;
    } else {
      items.push({ sku, name: product.name, price, quantity: Math.max(1, Number(quantity || 1)), image, color, size });
    }
    cart.items = items;
    await cart.save();
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

exports.updateQuantity = async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const { key } = req.params;
    const { quantity } = req.body || {};
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const idx = cart.items.findIndex((i) => buildKey(i) === key);
    if (idx < 0) return res.status(404).json({ message: 'Item not found' });
    cart.items[idx].quantity = Math.max(1, Number(quantity || 1));
    await cart.save();
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const { key } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter((i) => buildKey(i) !== key);
    await cart.save();
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

exports.clear = async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const cart = await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } }, { new: true, upsert: true });
    res.json(cart);
  } catch (err) {
    next(err);
  }
};
