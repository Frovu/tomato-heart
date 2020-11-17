/* eslint-disable no-undef, no-unused-vars*/
global.log = () => {};
jest.mock('pg');
const { Pool } = require('pg');
let data;
const queryFn = jest.fn((q, values) => {
	if(typeof q === 'object')
		return {rows: []};
	for(const a in data)
		if(a!=='key' && !values.includes(data[a]))
			return false;
	return true;
});
Pool.mockImplementation((_config) => {
	return {
		connect: jest.fn(),
		query: queryFn
	};
});

const settings = require('../modules/settings.js');
require('dotenv').config();

const express = require('express');
const router = require('../routes/heart.js');
const request = require('supertest');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support url-encoded
app.use('/heart', router);


const db = require('../modules/database.js');
const KEY = 'testkey';
const authFn = jest.spyOn(db, 'authorize').mockImplementation((key)=>{
	return KEY === key;
});
data = {
	t: 42.42,
	p: 45.42,
	h: 42.42,
	wt1: 42.42,
	wt2: 99.99,
	sm1: 42.42,
	sm2: 42.42,
	st1: 42.42,
	st2: 43.42,
	key: KEY
};

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

	describe('invalid data post', () => {
		it('responses with 400', async () => {
			const res = await request(app)
				.post('/heart/data')
				.send({t: 'a42', ad: 'asd'});
			expect(res.status).toEqual(400);
			expect(queryFn).not.toHaveBeenCalled();
		});
	});

	describe('data post with invalid key', () => {
		const badKeyData = Object.assign({}, data);
		badKeyData.key = 'asdsadsadssda';
		it('responses with 401 unauthorized', async () => {
			const res = await request(app)
				.post('/heart/data')
				.send(badKeyData);
			expect(res.status).toEqual(401);
			expect(queryFn).not.toHaveBeenCalled();
		});
	});

	describe('valid data post with valid key', () => {
		data.key = KEY;
		it('works with application/json', async () => {
			const res = await request(app)
				.post('/heart/data')
				.send(data);
			expect(res.status).toEqual(200);
			expect(queryFn).toHaveBeenCalled();
			expect(queryFn).toHaveLastReturnedWith(true);
		});
		it('works with x-www-form-urlencoded', async () => {
			const req = Object.keys(data).map(k => `${k}=${data[k]}`).join('&');
			const res = await request(app)
				.post('/heart/data')
				.send(req);
			expect(res.status).toEqual(200);
			expect(queryFn).toHaveBeenCalled();
			expect(queryFn).toHaveLastReturnedWith(true);
		});
	});

	describe('invalid event post', () => {
		it('forbids no message', async () => {
			const body = {val: true, key: KEY};
			const res = await request(app)
				.post('/heart/event')
				.send(body);
			expect(res.status).toEqual(400);
			expect(queryFn).not.toHaveBeenCalled();
		});
		it('forbids not string message', async () => {
			const body = {msg: 42, val: true, key: KEY};
			const res = await request(app)
				.post('/heart/event')
				.send(body);
			expect(res.status).toEqual(400);
			expect(queryFn).not.toHaveBeenCalled();
		});
		it('forbids not bool value message', async () => {
			const body = {val: 42, key: KEY};
			const res = await request(app)
				.post('/heart/event')
				.send(body);
			expect(res.status).toEqual(400);
			expect(queryFn).not.toHaveBeenCalled();
		});
	});

	describe('valid event post', () => {
		it('responses with 401 if bad key', async () => {
			const body = {msg: 'an event', key: 'baddd', val: true};
			const res = await request(app)
				.post('/heart/event')
				.send(body);
			expect(res.status).toEqual(401);
			expect(queryFn).not.toHaveBeenCalled();
		});
		it('works with val', async () => {
			const body = {msg: 'an event', key: KEY, val: true};
			const res = await request(app)
				.post('/heart/event')
				.send(body);
			expect(res.status).toEqual(200);
			expect(queryFn).toHaveBeenCalled();
		});
		it('works without val', async () => {
			const body = {msg: 'an event', key: KEY};
			const res = await request(app)
				.post('/heart/event')
				.send(body);
			expect(res.status).toEqual(200);
			expect(queryFn).toHaveBeenCalled();
		});
	});

	afterEach(() => {
		queryFn.mockClear();
	});
});
