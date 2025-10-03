const express = require('express');
const router = express.Router();
const orderPresenter = require('../presenters/orderPresenter');
const { log } = require('../utils/logger');

// Get all orders
router.get('/', (req, res) => {
    log('GET /api/orders');
    const result = orderPresenter.getOrders();
    res.status(result.success ? 200 : result.status || 500).json(result);
});

// Create order
router.post('/', (req, res) => {
    const { userId, items } = req.body;
    log(`POST /api/orders for user ${userId}`);
    const result = orderPresenter.createOrder(userId, items);
    res.status(result.success ? result.status || 200 : result.status || 500).json(result);
});

// Update order
router.put('/:orderId', (req, res) => {
    const { orderId } = req.params;
    const { items } = req.body;
    log(`PUT /api/orders/${orderId}`);
    const result = orderPresenter.updateOrder(orderId, items);
    res.status(result.success ? 200 : result.status || 500).json(result);
});

// Cancel order
router.delete('/:orderId', (req, res) => {
    const { orderId } = req.params;
    log(`DELETE /api/orders/${orderId}`);
    const result = orderPresenter.cancelOrder(orderId);
    res.status(result.success ? result.status || 200 : result.status || 500).json(result);
});

// Get order status
router.get('/:orderId/status', (req, res) => {
    const { orderId } = req.params;
    log(`GET /api/orders/${orderId}/status`);
    const result = orderPresenter.getOrderStatus(orderId);
    res.status(result.success ? 200 : result.status || 500).json(result);
});

module.exports = router;