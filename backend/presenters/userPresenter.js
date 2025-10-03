const userModel = require('../models/user');
const menuItemModel = require('../models/menuItem'); // To validate item existence
const { error } = require('../utils/logger');

const getUserFavorites = (userId) => {
    try {
        const favoriteIds = userModel.getFavorites(userId);
        const favoriteItems = favoriteIds.map(id => menuItemModel.getById(id)).filter(item => item !== undefined);
        return { success: true, data: favoriteItems };
    } catch (err) {
        error(`Error getting favorites for user ${userId}: ${err.message}`);
        return { success: false, message: 'Internal server error' };
    }
};

const addFavorite = (userId, itemId) => {
    try {
        if (!itemId) {
            return { success: false, message: 'itemId is required', status: 400 };
        }
        if (!menuItemModel.getById(itemId)) {
            return { success: false, message: 'Item not found in menu', status: 404 };
        }
        const added = userModel.addFavorite(userId, itemId);
        if (!added) {
            return { success: false, message: 'Item already favorited', status: 409 }; // Conflict
        }
        return { success: true, data: userModel.getFavorites(userId), status: 200 };
    } catch (err) {
        error(`Error adding favorite ${itemId} for user ${userId}: ${err.message}`);
        return { success: false, message: 'Internal server error' };
    }
};

const removeFavorite = (userId, itemId) => {
    try {
        const removed = userModel.removeFavorite(userId, itemId);
        if (!removed) {
            return { success: false, message: 'Favorite item not found for this user', status: 404 };
        }
        return { success: true, status: 204 };
    } catch (err) {
        error(`Error removing favorite ${itemId} for user ${userId}: ${err.message}`);
        return { success: false, message: 'Internal server error' };
    }
};

module.exports = {
    getUserFavorites,
    addFavorite,
    removeFavorite,
};