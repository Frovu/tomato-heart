const express = require('express');
const settings = require('./settings');
const router = express.Router();

// get default settings
router.get('/default', (req, res) => {
    return res.status(200).json(settings.default);
});

// get current settings
router.get('/', (req, res) => {
    // TODO: ??? authentication
    return res.status(200).json(settings.get());
});

// update settings
router.post('/', (req, res) => {
    // TODO: authentication
    return res.status(501).end();
});

module.exports = router;
