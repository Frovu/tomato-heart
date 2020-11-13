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
		let i=0;
		const fields = Object.keys(data);
		const q = `INSERT INTO data (${fields.join(', ')}) VALUES (${fields.map(()=>`$${++i}`).join(',')})`;
		await db.pool.query(q, Object.values(data));
		return res.sendStatus(200);
	} catch (e) {
		global.log(`ERROR: (POST heart/data) ${e.stack}`);
		return res.sendStatus(500);
	}
});

// post event
router.post('/event', async (req, res) => {
	try {
		const data = typeof req.body === 'object' && req.body;
		if(!data || typeof data.message === 'string')
			return res.sendStatus(400);
		await db.pool.query('INSERT INTO events (message) VALUES ($1)', data.message);
		return res.sendStatus(200);
	} catch (e) {
		global.log(`ERROR: (POST heart/event) ${e.stack}`);
		return res.sendStatus(500);
	}
});

module.exports = router;
