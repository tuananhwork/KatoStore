const User = require('../models/User');

exports.seedAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const adminEmail = (email || process.env.ADMIN_EMAIL || 'admin@katostore.com').toLowerCase();
    const adminName = name || process.env.ADMIN_NAME || 'Admin';
    const adminPassword = password || process.env.ADMIN_PASSWORD || 'Admin@123';

    let user = await User.findOne({ email: adminEmail });
    if (!user) {
      const passwordHash = await User.hashPassword(adminPassword);
      user = await User.create({ name: adminName, email: adminEmail, passwordHash, role: 'admin', isActive: true });
    } else {
      // ensure role is admin and active
      const update = { role: 'admin', isActive: true };
      if (password) {
        update.passwordHash = await User.hashPassword(adminPassword);
      }
      user = await User.findByIdAndUpdate(user._id, update, { new: true });
    }

    return res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { role, active } = req.query;
    const query = {};
    if (role) query.role = role;
    if (active !== undefined) query.isActive = active === 'true';

    const users = await User.find(query)
      .select('_id name email role isActive createdAt avatar')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    next(err);
  }
};
