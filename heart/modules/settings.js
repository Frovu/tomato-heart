
const fs = require('fs');
const filename = './settings.json'; // relative to cwd
const crypto = require('crypto');

const ranges = require('../public/ranges.json');
const defaults = require('../settings_default.json');
const settings = fs.existsSync(filename) ?
	require('.' + filename) : Object.assign({}, defaults);

module.exports.check = (sum) => sum === settings.sum;

module.exports.default = defaults;
module.exports.get = () => settings;

const save = () =>
	fs.writeFileSync(filename, JSON.stringify(settings, null, 2), 'utf8');

const inRange = (val, range) => typeof val === 'number' && val >= range[0] && val <= range[1];

module.exports.validate = obj => {
	try {
		for(const i of ['heartbeat', 'datarate'])
			if(!inRange(obj[i], ranges[i]))
				return false;
		const day = [];
		for(const i of [0, 1]) {
			const v = obj.day[i];
			if(!v.match(/^\d?\d:\d\d$/)) return false;
			const time = v.split(':').map(a => parseInt(a));
			if(isNaN(time[0]) || time[0]<0 || time[0]>23
				|| isNaN(time[1]) || time[1]<0 || time[0]>59)
				return false;
			day[i] = time[0]*60+time[1];
		}
		if(day[0] >= day[1]) return false;
		// per section settings
		for(const i of ['0', '1']) {
			for(const j of ['day', 'night'])
				for(const v of [0, 1]) // low and up
					if(!inRange(obj[i][j][v], ranges.temp))
						return false;
			if(!inRange(obj[i].wire, ranges.wireTemp))
				return false;
			if(typeof obj[i].on !== 'boolean')
				return false;
		}
		return true;
	} catch(e) {
		return false;
	}
};

module.exports.update = newSettings => {
	settings.settings = newSettings;
	settings.sum = crypto.createHash('md5')
		.update(JSON.stringify(settings.settings))
		.digest('hex');
	save();
	global.log(`settings updated: ${JSON.stringify(settings.settings)}`);
	return settings;
};
