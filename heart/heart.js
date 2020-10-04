const express = require('express');
const settings = require('./settings');
const router = express.Router();

router.get('/', (req, res) => {
    if(!req.query.s)
        return res.status(400).end();
    if(settings.check(req.query.s))
        return res.status(200).send('OK');
    else
        return res.status(205).json(settings.get());
});

router.post('/', (req, res) => {
    console.log('post heart');
});

module.exports = router;
