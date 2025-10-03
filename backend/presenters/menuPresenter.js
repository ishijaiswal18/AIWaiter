const menuItemModel = require('../models/menuItem');
const { error } = require('../utils/logger');

const getMenu = () => {
    try {
        return { success: true, data: menuItemModel.getAll() };
    } catch (err) {
        error(`Error getting all menu items: ${err.message}`);
        return { success: false, message: 'Internal server error' };
    }
};

const getMenuByCategory = (categoryName) => {
    try {
        const items = menuItemModel.getByCategory(categoryName);
        if (items.length === 0) {
            return { success: false, message: 'Category not found or no items in category', status: 404 };
        }
        return { success: true, data: items };
    } catch (err) {
        error(`Error getting menu by category ${categoryName}: ${err.message}`);
        return { success: false, message: 'Internal server error' };
    }
};

const getMenuByType = (foodType) => {
    try {
        const items = menuItemModel.getByType(foodType);
        if (items.length === 0) {
            return { success: false, message: 'Food type not found or no items of this type', status: 404 };
        }
        return { success: true, data: items };
    } catch (err) {
        error(`Error getting menu by type ${foodType}: ${err.message}`);
        return { success: false, message: 'Internal server error' };
    }
};

const searchMenu = (query) => {
    try {
        if (!query) {
            return { success: false, message: 'Search query is required', status: 400 };
        }
        const items = menuItemModel.search(query);
        return { success: true, data: items };
    } catch (err) {
        error(`Error searching menu for ${query}: ${err.message}`);
        return { success: false, message: 'Internal server error' };
    }
};

const getSpecials = () => {
    try {
        return { success: true, data: menuItemModel.getSpecials() };
    } catch (err) {
        error(`Error getting specials: ${err.message}`);
        return { success: false, message: 'Internal server error' };
    }
};

const getItemDetails = (itemId) => {
    try {
        const item = menuItemModel.getById(itemId);
        if (!item) {
            return { success: false, message: 'Item not found', status: 404 };
        }
        return { success: true, data: item };
    } catch (err) {
        error(`Error getting item details for ${itemId}: ${err.message}`);
        return { success: false, message: 'Internal server error' };
    }
};

module.exports = {
    getMenu,
    getMenuByCategory,
    getMenuByType,
    searchMenu,
    getSpecials,
    getItemDetails,
};