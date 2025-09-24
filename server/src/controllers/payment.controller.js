const qs = require('qs');
const crypto = require('crypto');
const { vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl } = require('../config/vnpay');
const Order = require('../models/Order');

// Sắp xếp key theo alphabet
function sortObject(obj) {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });
  return sorted;
}

// Format yyyyMMddHHmmss GMT+7
function formatVnpDate(date) {
  const tzOffsetMs = 7 * 60 * 60 * 1000;
  const d = new Date(date.getTime() + tzOffsetMs);
  const YYYY = d.getUTCFullYear();
  const MM = String(d.getUTCMonth() + 1).padStart(2, '0');
  const DD = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `${YYYY}${MM}${DD}${hh}${mm}${ss}`;
}

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff && typeof xff === 'string') {
    const ip = xff.split(',')[0].trim();
    if (ip && ip.indexOf(':') === -1) return ip; // IPv4 only
  }
  const raw = req.connection?.remoteAddress || req.ip || '127.0.0.1';
  if (raw && raw.includes(':')) return '127.0.0.1';
  return raw;
}

exports.vnpayCreate = async (req, res, next) => {
  try {
    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ message: 'orderId is required' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const now = new Date();
    const createDate = formatVnpDate(now);
    const expireDate = formatVnpDate(new Date(now.getTime() + 15 * 60 * 1000)); // +15 mins

    const amount = Math.max(0, Math.round(order.total || 0)) * 100;

    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode,
      vnp_Amount: String(amount),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: String(order._id),
      vnp_OrderInfo: `Thanh toan don hang ${String(order._id).slice(-6)}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl,
      vnp_IpAddr: getClientIp(req),
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    const sorted = sortObject(vnpParams);

    // Encode trước khi ký
    const signData = qs.stringify(sorted, { encode: true });
    const signed = crypto.createHmac('sha512', vnp_HashSecret).update(signData, 'utf-8').digest('hex');

    const paymentUrl = `${vnp_Url}?${qs.stringify(
      {
        ...sorted,
        vnp_SecureHash: signed,
        vnp_SecureHashType: 'HmacSHA512',
      },
      { encode: true }
    )}`;

    console.log('[VNPAY][CREATE] signData:', signData);
    console.log('[VNPAY][CREATE] secureHash:', signed);

    return res.json({ paymentUrl });
  } catch (err) {
    console.error('[VNPAY][CREATE][ERROR]:', err);
    next(err);
  }
};

exports.vnpayReturn = async (req, res, next) => {
  try {
    const vnpParams = { ...req.query };
    const secureHash = vnpParams.vnp_SecureHash;

    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const sorted = sortObject(vnpParams);
    const signData = qs.stringify(sorted, { encode: true });
    const signed = crypto.createHmac('sha512', vnp_HashSecret).update(signData, 'utf-8').digest('hex');

    console.log('[VNPAY][RETURN] signData:', signData);
    console.log('[VNPAY][RETURN] secureHash (computed):', signed);
    console.log('[VNPAY][RETURN] secureHash (provided):', secureHash);

    if (signed !== secureHash) {
      return res.status(400).json({ RspCode: '97', Message: 'Invalid signature' });
    }

    const orderId = vnpParams.vnp_TxnRef;
    const rspCode = vnpParams.vnp_ResponseCode;

    if (rspCode === '00') {
      await Order.findByIdAndUpdate(orderId, {
        status: 'processing',
        paidAt: new Date(),
        paymentMethod: 'vnpay',
      });
    }

    const redirectUrl = process.env.CLIENT_SUCCESS_URL || 'http://localhost:5173/profile?tab=orders';
    return res.redirect(redirectUrl);
  } catch (err) {
    next(err);
  }
};

exports.vnpayIpn = async (req, res, next) => {
  try {
    const vnpParams = { ...req.query };
    const secureHash = vnpParams.vnp_SecureHash;

    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const sorted = sortObject(vnpParams);
    const signData = qs.stringify(sorted, { encode: true });
    const signed = crypto.createHmac('sha512', vnp_HashSecret).update(signData, 'utf-8').digest('hex');

    console.log('[VNPAY][IPN] signData:', signData);
    console.log('[VNPAY][IPN] secureHash (computed):', signed);
    console.log('[VNPAY][IPN] secureHash (provided):', secureHash);

    if (signed !== secureHash) {
      return res.json({ RspCode: '97', Message: 'Invalid signature' });
    }

    const orderId = vnpParams.vnp_TxnRef;
    const rspCode = vnpParams.vnp_ResponseCode;

    if (rspCode === '00') {
      await Order.findByIdAndUpdate(orderId, {
        status: 'processing',
        paidAt: new Date(),
        paymentMethod: 'vnpay',
      });
      return res.json({ RspCode: '00', Message: 'Confirm Success' });
    }

    return res.json({ RspCode: '00', Message: 'Confirm Fail' });
  } catch (err) {
    next(err);
  }
};
