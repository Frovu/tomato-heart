const express = require('express');
const settings = require('../modules/settings');
const router = express.Router();
const db = require('../modules/database');

// get default settings
router.get('/default', (req, res) => {
	return res.status(200).json(settings.default);
});

// get current settings
router.get('/', (req, res) => {
	return res.status(200).json(settings.get().settings);
});

// get last data from devices
router.get('/status', (req, res) => {
	return res.status(200).json(db.last);
});

// query data
router.get('/data', async (req, res) => {
	const resp = await db.get(req.query);
	if(resp)
		res.status(200).json(resp);
	else
		res.sendStatus(400);
});

// update settings
router.post('/', (req, res) => {
	const set = req.body && req.body.settings;
	if(!set || !Object.keys(set).length || !settings.validate(set))
		return res.sendStatus(400);
	if(!req.body.secret || req.body.secret !== process.env.SECRET)
		return res.sendStatus(401);
	const updated = settings.update(set);
	if(updated)
		return res.status(200).json(updated);
	res.status(500).end();
});

module.exports = router;
