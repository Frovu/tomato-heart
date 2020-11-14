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
		let i=1;
		const fields = Object.keys(data);
		const q = `INSERT INTO data (dev, ${fields.join(', ')}) VALUES ($1,${fields.map(()=>`$${++i}`).join(',')})`;
		await db.pool.query(q, [devId].concat(Object.values(data)));
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
		const val = data.val;
		if(!data || typeof data.msg !== 'string' || (val && typeof val !== 'boolean'))
			return res.sendStatus(400);
		const devId = db.authorize(data.key);
		if(!devId) // not a known device key
			return res.sendStatus(401);
		const q = `INSERT INTO events(devId, message${val?',value':''}) VALUES ($1,$2${val?',$3':''})`;
		await db.pool.query(q, [devId, data.msg].concat(val?[val]:val));
		return res.sendStatus(200);
	} catch (e) {
		global.log(`ERROR: (POST heart/event) ${e.stack}`);
		return res.sendStatus(500);
	}
});

module.exports = router;
