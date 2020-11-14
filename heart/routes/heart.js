const express = require('express');
const settings = require('../modules/settings');
const router = express.Router();
const db = require('../modules/database');

// get new settings if changed
router.get('/', (req, res) => {
	if(req.query.s && settings.check(req.query.s))
		return res.status(200).send('OK');
	else
		return res.status(205).json(settings.get());
});

// post measurments
router.post('/data', async (req, res) => {
	try {
		const data = typeof req.body === 'object' && db.validateData(req.body, 'data');
		if(!data)
			return res.sendStatus(400);
		const devId = db.authorize(req.body.key);
		if(!devId) // not a known device key
			return res.sendStatus(401);
		await db.insert(devId, data, 'data');
		res.sendStatus(200);
	} catch (e) {
		global.log(`ERROR: (POST heart/data) ${e.stack}`);
		return res.sendStatus(500);
	}
});

// post event
router.post('/event', async (req, res) => {
	try {
		const data = typeof req.body === 'object' && db.validateData(req.body, 'event');
		if(!data || typeof data.msg !== 'string' || (data.val && typeof data.val !== 'boolean'))
			return res.sendStatus(400);
		const devId = db.authorize(req.body.key);
		if(!devId) // not a known device key
			return res.sendStatus(401);
		await db.insert(devId, data, 'event');
		res.sendStatus(200);
	} catch (e) {
		global.log(`ERROR: (POST heart/event) ${e.stack}`);
		return res.sendStatus(500);
	}
});

module.exports = router;
