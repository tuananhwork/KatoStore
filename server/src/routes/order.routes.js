const router = require('express').Router();
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/roles');
const controller = require('../controllers/order.controller');

// Auth required for all orders
router.get('/', auth, controller.list);
router.get('/:id', auth, controller.get);
router.post('/', auth, controller.create); // customer creates own order

// Manager/Admin can update status
router.patch(
  '/:id/status',
  auth,
  requireRole('manager', 'admin'),
  controller.updateStatus
);

// Customer can cancel own order (and manager/admin too)
router.post('/:id/cancel', auth, controller.cancel);

module.exports = router;
