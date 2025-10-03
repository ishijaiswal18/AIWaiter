const express = require('express');
const router = express.Router();
const menuPresenter = require('../presenters/menuPresenter');
const { log } = require('../utils/logger');

// Get all menu items
router.get('/', (req, res) => {
    log('GET /api/menu');
    const result = menuPresenter.getMenu();
    res.status(result.success ? 200 : result.status || 500).json(result);
});

// Get menu by category
router.get('/category/:categoryName', (req, res) => {
    const { categoryName } = req.params;
    log(`GET /api/menu/category/${categoryName}`);
    const result = menuPresenter.getMenuByCategory(categoryName);
    res.status(result.success ? 200 : result.status || 500).json(result);
});

// Get menu by food type (veg/non-veg)
router.get('/type/:foodType', (req, res) => {
    const { foodType } = req.params;
    log(`GET /api/menu/type/${foodType}`);
    const result = menuPresenter.getMenuByType(foodType);
    res.status(result.success ? 200 : result.status || 500).json(result);
});

// Search menu
router.get('/search', (req, res) => {
    const { q } = req.query;
    log(`GET /api/menu/search?q=${q}`);
    const result = menuPresenter.searchMenu(q);
    res.status(result.success ? 200 : result.status || 500).json(result);
});

// Get specials
router.get('/specials', (req, res) => {
    log('GET /api/specials');
    const result = menuPresenter.getSpecials();
    res.status(result.success ? 200 : result.status || 500).json(result);
});

// Get item details by ID
router.get('/:itemId', (req, res) => {
    const { itemId } = req.params;
    log(`GET /api/menu/${itemId}`);
    const result = menuPresenter.getItemDetails(itemId);
    res.status(result.success ? 200 : result.status || 500).json(result);
});

module.exports = router;