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

	describe('invalid data insertion', () => {
		it('responses with 400', async () => {
			const res = await request(app)
				.post('/heart/data')
				.send({t: 42, ad: 'asd'});
			expect(res.status).toEqual(400);
		});
	});

	describe('data insertion with invalid key', () => {
		const badKeyData = Object.assign({}, data);
		badKeyData.key = 'asdsadsadssda';
		it('responses with 401 unauthorized', async () => {
			const res = await request(app)
				.post('/heart/data')
				.send(badKeyData);
			expect(res.status).toEqual(401);
		});
	});

	describe('valid data insertion with valid key', () => {
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
});
