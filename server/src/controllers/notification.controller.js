const Notification = require('../models/Notification');

exports.listMy = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unread } = req.query;
    const filter = { userId: req.user.sub };
    if (String(unread) === 'true') filter.read = false;
    const items = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Notification.countDocuments(filter);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findOne({ _id: id, userId: req.user.sub });
    if (!notif) return res.status(404).json({ message: 'Not found' });
    notif.read = true;
    await notif.save();
    res.json(notif);
  } catch (err) {
    next(err);
  }
};

exports.listAll = async (req, res, next) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    const { page = 1, limit = 20 } = req.query;
    const items = await Notification.find()
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Notification.countDocuments();
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};
