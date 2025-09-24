const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const mediaRoutes = require('./routes/media.routes');
const notificationRoutes = require('./routes/notification.routes');
const cartRoutes = require('./routes/cart.routes');
const paymentRoutes = require('./routes/payment.routes');
const errorHandler = require('./middlewares/errorHandler');

function createApp() {
  const app = express();

  const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

  app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use('/auth', authRoutes);
  app.use('/admin', adminRoutes);
  app.use('/products', productRoutes);
  app.use('/orders', orderRoutes);
  app.use('/media', mediaRoutes);
  app.use('/notifications', notificationRoutes);
  app.use('/cart', cartRoutes);
  app.use('/payments', paymentRoutes);
  app.use('/api/payments', paymentRoutes);

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
