/**
 * Express App Configuration
 * Setup middleware dan routing utama
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const builderRoutes = require('./routes/builder.routes');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ─── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/builder', builderRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        message: '✅ E-Commerce + PC Builder API is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            products: '/api/products',
            cart: '/api/cart',
            orders: '/api/orders',
            builder: '/api/builder',
        },
    });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
