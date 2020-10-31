/* eslint-disable no-undef, no-unused-vars*/
global.log = require('../modules/logging.js');
const settings = require('../modules/settings.js');

const express = require('express');
const router = require('../routes/heart.js');
const request = require('supertest');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support url-encoded
app.use('/heart', router);


describe('heart', () => {
	let sum = 'empty';
	beforeAll(async (done) => {
		const res = await request(app).get('/heart');
		sum = res.body.sum; done();
	});

	describe('beat with bad sum', () => {
		it('responses 205 + settings json', async () => {
			const res = await request(app)
				.get('/heart')
				.query({s: 'asdsadasdad'});
			expect(res.status).toEqual(205);
			expect(res.body).toHaveProperty('settings');
		});
	});

	describe('beat with matching sum', () => {
		it('responses with 200', async () => {
			const res = await request(app)
				.get('/heart')
				.query({s: sum});
			expect(res.status).toEqual(200);
		});
	});
});
