const router = require('express').Router();
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/roles');
const controller = require('../controllers/product.controller');

// Public
router.get('/', controller.list);
router.get('/:sku', controller.getBySku);

// Manager/Admin
router.post('/', auth, requireRole('manager', 'admin'), controller.create);
router.patch('/:sku', auth, requireRole('manager', 'admin'), controller.update);
router.delete('/:sku', auth, requireRole('admin'), controller.remove);
router.post(
  '/:sku/toggle',
  auth,
  requireRole('manager', 'admin'),
  controller.toggleVisibility
);

module.exports = router;
