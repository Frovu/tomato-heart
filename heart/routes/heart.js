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

// post measurments or event
router.post('/', async (req, res) => {
	try {
		if(typeof req.body.data !== 'object' || !db.validateData(req.body.data))
			return res.sendStatus(400);
		let i=0;
		const fields = Object.keys(req.body.data);
		const q = `INSERT INTO data (${fields.join(', ')}) VALUES (${fields.map(`$${++i}`).join(',')})`;
		console.log(q)
		const resp = await db.query(q, Object.values(req.body.data));
		console.log(resp)
		return res.sendStatus(200);
	} catch (e) {
		console.log(e)
		global.log(e);
		return res.sendStatus(500);
	}
});

module.exports = router;
