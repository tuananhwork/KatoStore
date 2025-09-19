const router = require('express').Router();
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/roles');
const controller = require('../controllers/admin.controller');
const orderController = require('../controllers/order.controller');
const productController = require('../controllers/product.controller');

router.post('/seed', auth, requireRole('admin'), controller.seedAdmin);
router.get('/users', auth, requireRole('admin'), controller.getUsers);

// Admin Orders
router.get('/orders', auth, requireRole('admin', 'manager'), orderController.list);
router.patch('/orders/:id', auth, requireRole('admin', 'manager'), orderController.updateStatus);

// Admin Products (include inactive)
router.get('/products', auth, requireRole('admin', 'manager'), productController.adminList);

module.exports = router;
