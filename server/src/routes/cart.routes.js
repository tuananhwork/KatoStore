const router = require('express').Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/cart.controller');

router.use(auth);

router.get('/mine', ctrl.getMine);
router.put('/', ctrl.replace);
router.post('/items', ctrl.addOrUpdateItem);
router.patch('/items/:key/quantity', ctrl.updateQuantity);
router.delete('/items/:key', ctrl.removeItem);
router.delete('/', ctrl.clear);

module.exports = router;
