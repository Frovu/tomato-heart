/* eslint-disable no-undef, no-unused-vars*/
global.log = () => {};
jest.mock('pg');
const { Pool } = require('pg');
const queryFn = jest.fn((q, values) => {
	if(typeof q === 'object')
		return {rows: []};
	return true;
});
Pool.mockImplementation((_config) => {
	return {
		connect: jest.fn(),
		query: queryFn
	};
});

const fs = require('fs');
jest.spyOn(fs, 'writeFileSync').mockImplementation(()=>{});
const settings = require('../modules/settings.js');
require('dotenv').config();

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

	describe('get default settings', () => {
		it('sends valid json', async () => {
			const res = await request(app).get('/user/default');
			expect(res.body).toHaveProperty('settings');
		});
	});

	describe('post settings updates', () => {
		it('responds 400 if invalid', async () => {
			const res = await request(app)
				.post('/user')
				.send({asd: 123, secret: process.env.SECRET});
			expect(res.status).toEqual(400);
		});

		it('responds 401 if no secret', async () => {
			const res = await request(app)
				.post('/user')
				.send({settings: {asd: 123}});
			expect(res.status).toEqual(401);
		});
		it('responds 401 if secret bad', async () => {
			const res = await request(app)
				.post('/user')
				.send({settings: {asd: 123}, secret: '__Invalid__'});
			expect(res.status).toEqual(401);
		});

		it('changes settings if all ok', async () => {
			const changes = {settings: {a: 123}};
			changes.secret = process.env.SECRET;
			let res = await request(app)
				.post('/user')
				.send(changes);
			expect(res.status).toEqual(200);
			res = await request(app).get('/user');
			expect(res.status).toEqual(200);
			expect(res.body)
				.toEqual(changes.settings);
		});
	});

	describe('get status', () => {
		it('responses with 200', async () => {
			const res = await request(app).get('/user/status');
			expect(res.status).toEqual(200);
		});
	});
});
