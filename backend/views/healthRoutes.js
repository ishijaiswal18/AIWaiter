const express = require('express');
const router = express.Router();
const { log } = require('../utils/logger');

router.get('/', (req, res) => {
    log('Health check requested');
    res.status(200).json({ status: 'ok', message: 'AIWaiter backend is running' });
});

module.exports = router;