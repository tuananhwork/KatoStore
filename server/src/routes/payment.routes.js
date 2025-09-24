const router = require('express').Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/payment.controller');

router.post('/vnpay/create', auth, ctrl.vnpayCreate);
router.get('/vnpay/return', ctrl.vnpayReturn);
router.get('/vnpay/ipn', ctrl.vnpayIpn);

module.exports = router;
