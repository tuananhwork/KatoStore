const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  const payload = { sub: user._id.toString(), email: user.email, role: user.role, name: user.name };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret_change_me', { expiresIn: '1h' });
  return token;
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existed = await User.findOne({ email: email.toLowerCase() });
    if (existed) return res.status(409).json({ message: 'Email already registered' });
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role: 'customer' });
    const accessToken = signToken(user);
    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const accessToken = signToken(user);
    return res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub).select(
      '_id name email role phone avatar dateOfBirth gender address'
    );
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    return res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { name, phone, avatar, dateOfBirth, gender, address } = req.body;

    const update = {};
    if (typeof name === 'string') update.name = name;
    if (typeof phone === 'string') update.phone = phone;
    if (typeof avatar === 'string') update.avatar = avatar;
    if (gender && ['male', 'female', 'other'].includes(gender)) update.gender = gender;
    if (dateOfBirth) update.dateOfBirth = new Date(dateOfBirth);
    if (address && typeof address === 'object') update.address = address;

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      select: '_id name email role phone avatar dateOfBirth gender address',
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  return res.json({ message: 'Logged out' });
};
