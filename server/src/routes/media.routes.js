const router = require('express').Router();
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/roles');
const { upload } = require('../middlewares/upload');
const controller = require('../controllers/media.controller');

router.post(
  '/upload',
  auth,
  requireRole('manager', 'admin'),
  upload.single('file'),
  controller.uploadSingle
);
router.post(
  '/uploads',
  auth,
  requireRole('manager', 'admin'),
  upload.array('files', 10),
  controller.uploadMultiple
);

module.exports = router;
