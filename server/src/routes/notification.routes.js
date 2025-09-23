const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/notification.controller');
const { addSubscriber, removeSubscriber, verifyTokenFromQuery } = require('../services/notificationStream');

router.get('/my', auth, controller.listMy);
router.patch('/:id/read', auth, controller.markRead);
router.get('/', auth, controller.listAll);

// Realtime notification via Server-Sent Events (SSE)
router.get('/stream', (req, res) => {
  // Accept token via query since EventSource cannot set custom headers
  const token = req.query.token;
  const payload = verifyTokenFromQuery(token);
  const userIdFromToken = payload?.sub || payload?.id;
  if (!userIdFromToken) {
    res.status(401).end();
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  // Keep connection alive
  const keepAlive = setInterval(() => {
    try {
      res.write(':\n\n');
    } catch {}
  }, 25000);

  const userId = String(userIdFromToken);
  addSubscriber(userId, res);

  // Send initial hello
  res.write(`data: ${JSON.stringify({ type: 'hello', message: 'connected' })}\n\n`);

  req.on('close', () => {
    clearInterval(keepAlive);
    removeSubscriber(userId, res);
  });
});

module.exports = router;
