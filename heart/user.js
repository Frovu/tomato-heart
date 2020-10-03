const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log('get user');
});

router.post('/', (req, res) => {
    console.log('post user');
});

module.exports = router;
