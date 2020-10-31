/* eslint-disable no-undef, no-unused-vars*/
global.log = () => {};
const settings = require('../modules/settings.js');

const express = require('express');
const request = require('supertest');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support url-encoded
app.use('/user', require('../routes/user.js'));


describe('user api', () => {
	let oldSettings;
	beforeAll(async (done) => {
		const res = await request(app).get('/user');
		oldSettings = res.body; done();
	});

	describe('get default', () => {
		it('sends valid json', async () => {
			const res = await request(app).get('/user/default');
			expect(res.body).toHaveProperty('settings');
		});
	});

	describe('post updates and get updated', () => {
		const changes = {a: 321, b: false};
		it('changes settings json', async () => {
			let res = await request(app)
				.post('/user')
				.send(changes);
			expect(res.status).toEqual(200);
			res = await request(app).get('/user');
			expect(res.status).toEqual(200);
			expect(res.body)
				.toEqual(Object.assign(oldSettings, changes));
		});
	});
});
