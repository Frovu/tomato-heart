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
    return res.status(200).json(settings.get().settings);
});

// update settings
router.post('/', (req, res) => {
    // TODO: authentication
    if(!req.body || !Object.keys(req.body).length)
        return res.status(400).json({error: 'no changes'});
    const updated = settings.update(req.body);
    if(updated)
        return res.status(200).json(updated);
    res.status(500).end();
});

module.exports = router;
