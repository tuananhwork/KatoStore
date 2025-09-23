const router = require('express').Router();
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/roles');
const { upload } = require('../middlewares/upload');
const controller = require('../controllers/media.controller');

// Avatar uploads - allow any authenticated user
router.post('/avatar', auth, upload.single('file'), controller.uploadSingle);
router.post('/avatars', auth, upload.array('files', 5), controller.uploadMultiple);

// Product/media uploads - restricted to manager/admin
router.post('/upload', auth, requireRole('manager', 'admin'), upload.single('file'), controller.uploadSingle);
router.post('/uploads', auth, requireRole('manager', 'admin'), upload.array('files', 10), controller.uploadMultiple);

module.exports = router;
