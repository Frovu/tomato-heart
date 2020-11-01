const express = require('express');
const settings = require('../modules/settings');
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
	const set = req.body && req.body.settings;
	if(!set || !Object.keys(set).length)
		return res.sendStatus(400);
	if(!req.body.secret || req.body.secret !== process.env.SECRET)
		return res.sendStatus(401);
	const updated = settings.update(set);
	if(updated)
		return res.status(200).json(updated);
	res.status(500).end();
});

module.exports = router;
