require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const messageRoutes = require('./routes/messages');
const sellerRoutes = require('./routes/seller');
const adminRoutes = require('./routes/admin');
const currencyRoutes = require('./routes/currencies');
const blogRoutes = require('./routes/blog');
const sitemapRoutes = require('./routes/sitemap');
const botRenderer = require('./middleware/botRenderer');

const app = express();
connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Too many requests, slow down.' } });
app.use(globalLimiter);

// Bot renderer — intercepts Googlebot/Bingbot before API routes and serves SEO HTML
app.use(botRenderer);

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api/blog', blogRoutes);
app.use('/', sitemapRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 SaaSHub backend running on port ${PORT}`));
