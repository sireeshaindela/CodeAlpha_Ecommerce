const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');

// Route imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security headers with tailored Content Security Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.unsplash.com"],
        connectSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for single-origin / same-origin calls
app.use(
  cors({
    origin: process.env.APP_BASE_URL || 'http://localhost:3000',
    credentials: true
  })
);

// Persistent session management using connect-mongo
const isSecure = process.env.SESSION_COOKIE_SECURE === 'true';
const isTestEnv = process.env.NODE_ENV === 'test';

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'shopeasy_development_super_secure_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days in ms
  }
};

// In production and development, persist sessions in MongoDB
// In automated test environments, in-memory sessions prevent connection race conditions during teardown
if (!isTestEnv) {
  sessionConfig.store = MongoStore.create({
    clientPromise: new Promise((resolve) => {
      if (mongoose.connection.readyState === 1 && mongoose.connection.getClient()) {
        return resolve(mongoose.connection.getClient());
      }
      mongoose.connection.on('connected', () => {
        resolve(mongoose.connection.getClient());
      });
    }),
    collectionName: 'sessions',
    ttl: 60 * 60 * 24 * 7 // 7 days
  });
}

app.use(session(sessionConfig));

// Serve frontend static files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for unknown API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Fallback for non-API routes: serve 404.html
app.use((req, res) => {
  res.status(404).sendFile(path.join(frontendPath, '404.html'));
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
