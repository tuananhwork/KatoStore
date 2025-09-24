const router = require('express').Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/auth.controller');

router.post('/register', controller.register);
router.post('/register/request-otp', controller.registerRequestOTP);
router.post('/register/verify-otp', controller.registerVerifyOTP);
router.post('/login', controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', auth, controller.me);
router.patch('/me', auth, controller.updateMe);
router.post('/change-password', auth, controller.changePassword);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password-otp', controller.resetPasswordWithOTP);

module.exports = router;
