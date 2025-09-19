const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { sendMail } = require('../config/mailer');

function signToken(user) {
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  };
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
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'customer',
    });
    const accessToken = signToken(user);
    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.registerRequestOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Missing email' });
    const existed = await User.findOne({ email: email.toLowerCase() });
    if (existed) return res.status(409).json({ message: 'Email already registered' });

    // Use a pseudo user doc to store OTP against email if exists, otherwise create a transient doc? Simpler: upsert a stub with only email and token fields is risky.
    // Instead, we don't store user until verify; keep OTP in memory is not persistent. We'll reuse reset token fields via a shadow document mapping by email in a separate collection ideally.
    // For simplicity, send OTP back expecting verify request within 10 minutes; store hashed OTP in a lightweight cache by creating a temporary record in reset fields on a special temp user doc.

    // Create or update a shadow record in a dedicated collection is not present. We'll send OTP without persistence and ask client to include OTP immediately.
    // To persist securely with current model, we will create a minimal user record flagged inactive and complete on verify.

    let tempUser = await User.findOne({ email: email.toLowerCase() });
    if (!tempUser) {
      tempUser = await User.create({
        name: 'Pending User',
        email: email.toLowerCase(),
        passwordHash: await User.hashPassword(crypto.randomBytes(8).toString('hex')),
        role: 'customer',
        isActive: false,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    tempUser.resetPasswordToken = otpHash;
    tempUser.resetPasswordExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await tempUser.save();

    const subject = 'KatoStore - Mã OTP xác minh đăng ký';
    const html = `<p>Xin chào,</p>
      <p>Mã OTP xác minh đăng ký của bạn là:</p>
      <p style="font-size:22px;font-weight:bold;letter-spacing:4px">${otp}</p>
      <p>Mã có hiệu lực trong 10 phút.</p>`;
    await sendMail({ to: email.toLowerCase(), subject, html });

    return res.json({ message: 'OTP sent to email' });
  } catch (err) {
    next(err);
  }
};

exports.registerVerifyOTP = async (req, res, next) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!name || !email || !password || !otp) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    if (user.resetPasswordExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (otpHash !== user.resetPasswordToken) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.name = name;
    user.passwordHash = await User.hashPassword(password);
    user.isActive = true;
    user.emailVerifiedAt = new Date();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    const accessToken = signToken(user);
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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

    const updated = await User.findByIdAndUpdate(userId, update, {
      new: true,
      select: '_id name email role phone avatar dateOfBirth gender address',
    });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Missing email' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetPasswordToken = otpHash;
    user.resetPasswordExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const subject = 'KatoStore - Mã OTP khôi phục mật khẩu';
    const html = `<p>Xin chào ${user.name || ''},</p>
      <p>Mã OTP khôi phục mật khẩu của bạn là:</p>
      <p style="font-size:22px;font-weight:bold;letter-spacing:4px">${otp}</p>
      <p>Mã có hiệu lực trong 10 phút.</p>`;
    await sendMail({ to: user.email, subject, html });

    return res.json({ message: 'OTP sent if email exists' });
  } catch (err) {
    next(err);
  }
};

exports.resetPasswordWithOTP = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    if (user.resetPasswordExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (otpHash !== user.resetPasswordToken) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    return res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  return res.json({ message: 'Logged out' });
};
