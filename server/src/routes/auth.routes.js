const router = require('express').Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/auth.controller');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', auth, controller.me);
router.patch('/me', auth, controller.updateMe);
router.post('/logout', controller.logout);

module.exports = router;
