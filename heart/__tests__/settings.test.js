/* eslint-disable no-undef, no-unused-vars*/
const fs = require('fs');
jest.spyOn(fs, 'writeFileSync').mockImplementation(()=>{});

global.log = () => {};

const settings = require('../modules/settings.js');
const olds = settings.get();
const os = olds.settings;

describe('settings', () => {
	describe('check hashsum', () => {
		it('returns true', () => {
			const resp = settings.check(olds.sum);
			expect(resp).toEqual(true);
		});
		it('returns false', () => {
			const resp = settings.check('asdsadsa');
			expect(resp).toEqual(false);
		});
		it('updates and changes sum', () => {
			const nn = Object.assign({}, olds.settings, {heartbeat: 42});
			const resp = settings.update(nn);
			const res = settings.get();
			expect(res.settings.heartbeat).toEqual(42);
		});
	});

	describe('settings validation', () => {
		let changes;
		const news = () => Object.assign({}, os, changes);
		const newsp = (prop) => {
			const nws = Object.assign({}, os);
			nws[prop] = Object.assign({}, os[prop], changes);
			return nws;
		};
		it('returns true if all ok', () => {
			changes = {heartbeat: 20};
			expect(settings.validate(news())).toEqual(true);
			changes = {day: [13, 14]};
			expect(settings.validate(newsp('1'))).toEqual(true);
		});
		it('checks that "on" is bool', () => {
			changes = {on: 1};
			expect(settings.validate(newsp('1'))).toEqual(false);
			changes = {on: 'false'};
			expect(settings.validate(newsp('0'))).toEqual(false);
		});
		it('checks that numbers are numbers', () => {
			changes = {day: [11, '12']};
			expect(settings.validate(newsp('1'))).toEqual(false);
			changes = {day: [null, 14]};
			expect(settings.validate(newsp('0'))).toEqual(false);
			changes = {wire: '30'};
			expect(settings.validate(newsp('1'))).toEqual(false);
			changes = {heartbeat: '10'};
			expect(settings.validate(news())).toEqual(false);
			changes = {heartbeat: NaN};
			expect(settings.validate(news())).toEqual(false);
		});
		xit('checks ranges #1', () => {
			expect(settings.validate(mock_settings.sum)).toEqual(false);
		});
	});
});
