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
		const data = typeof req.body === 'object' && db.validateData(req.body);
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

module.exports = router;
