/* eslint-disable no-undef, no-unused-vars*/
const fs = require('fs');
jest.spyOn(fs, 'writeFileSync').mockImplementation(()=>{});

global.log = () => {};
const mock_settings = {
	settings: {'a': 1},
	sum: 'def'
};

jest.mock('../settings_default.json', () => mock_settings,
	{ virtual: true });
jest.mock('../settings.json', () => mock_settings,
	{ virtual: true });

const settings = require('../modules/settings.js');

describe('settings', () => {
	describe('check hashsum', () => {
		it('returns true', () => {
			const resp = settings.check(mock_settings.sum);
			expect(resp).toEqual(true);
		});
		it('returns false', () => {
			const resp = settings.check('asdsadsa');
			expect(resp).toEqual(false);
		});
		it('updates and changes sum', () => {
			const resp = settings.update({b: 2});
			const res = settings.get();
			expect(res.settings.b).toEqual(2);
		});
	});
});
