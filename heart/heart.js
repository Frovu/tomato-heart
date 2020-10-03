const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log('get heart');
});

router.post('/', (req, res) => {
    console.log('post heart');
});

module.exports = router;
