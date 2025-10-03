const express = require('express');
const router = express.Router();
const userPresenter = require('../presenters/userPresenter');
const { log } = require('../utils/logger');

// Get user favorites
router.get('/:userId/favorites', (req, res) => {
    const { userId } = req.params;
    log(`GET /api/users/${userId}/favorites`);
    const result = userPresenter.getUserFavorites(userId);
    res.status(result.success ? 200 : result.status || 500).json(result);
});

// Add to favorites
router.post('/:userId/favorites', (req, res) => {
    const { userId } = req.params;
    const { itemId } = req.body;
    log(`POST /api/users/${userId}/favorites for item ${itemId}`);
    const result = userPresenter.addFavorite(userId, itemId);
    res.status(result.success ? result.status || 200 : result.status || 500).json(result);
});

// Remove from favorites
router.delete('/:userId/favorites/:itemId', (req, res) => {
    const { userId, itemId } = req.params;
    log(`DELETE /api/users/${userId}/favorites/${itemId}`);
    const result = userPresenter.removeFavorite(userId, itemId);
    res.status(result.success ? result.status || 200 : result.status || 500).json(result);
});

// Call Human Waiter (this is a direct API, not tied to a model/presenter in the same way)
router.post('/waiter/call', (req, res) => {
    const { userId, message } = req.body;
    log(`POST /api/users/waiter/call by user ${userId}. Message: ${message || 'No message provided.'}`);
    res.status(200).json({ success: true, message: 'Human waiter has been notified.' });
});

module.exports = router;