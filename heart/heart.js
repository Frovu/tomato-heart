const express = require('express');
const settings = require('./settings');
const router = express.Router();

// get new settings if changed
router.get('/', (req, res) => {
    if(req.query.s && settings.check(req.query.s))
        return res.status(200).send('OK');
    else
        return res.status(205).json(settings.get());
});

// post measurments or event
router.post('/', (req, res) => {
    // TODO: sql insert
    console.warn('post /heart not implemented');
    return res.status(501).end();
});

module.exports = router;
