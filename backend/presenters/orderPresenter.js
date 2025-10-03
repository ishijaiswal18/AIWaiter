const orderModel = require('../models/order');
const { error } = require('../utils/logger');

const createOrder = (userId, items) => {
    try {
        if (!userId || !items || !Array.isArray(items) || items.length === 0) {
            return { success: false, message: 'Invalid order data', status: 400 };
        }
        const newOrder = orderModel.create(userId, items);
        return { success: true, data: newOrder, status: 201 };
    } catch (err) {
        error(`Error creating order for user ${userId}: ${err.message}`);
        return { success: false, message: 'Internal server error' };
    }
};

const updateOrder = (orderId, items) => {
    try {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return { success: false, message: 'Invalid items data for update', status: 400 };
        }
        const updatedOrder = orderModel.update(orderId, items);
        if (!updatedOrder) {
            return { success: false, message: 'Order not found', status: 404 };
        }
        return { success: true, data: updatedOrder };
    } catch (err) {
        error(`Error updating order ${orderId}: ${err.message}`);
        return { success: false, message: 'Internal server error' };
    }
};

const cancelOrder = (orderId) => {
    try {
        const cancelled = orderModel.cancel(orderId);
        if (!cancelled) {
            return { success: false, message: 'Order not found', status: 404 };
        }
        return { success: true, status: 204 };
    } catch (err) {
        error(`Error cancelling order ${orderId}: ${err.message}`);
        return { success: false, message: 'Internal server error' };
    }
};

const getOrderStatus = (orderId) => {
    try {
        const status = orderModel.getStatus(orderId);
        if (!status) {
            return { success: false, message: 'Order not found', status: 404 };
        }
        return { success: true, data: status };
    } catch (err) {
        error(`Error getting status for order ${orderId}: ${err.message}`);
        return { success: false, message: 'Internal server error' };
    }
};

const getOrders = () => {
    try {
        const orders = orderModel.getAll();
        return { success: true, data: orders };
    } catch (err) {
        error(`Error getting all orders: ${err.message}`);
        return { success: false, message: 'Internal server error' };
    }
};

module.exports = {
    createOrder,
    updateOrder,
    cancelOrder,
    getOrderStatus,
    getOrders,
};