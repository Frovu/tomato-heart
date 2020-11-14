const Pool = require('pg').Pool;
const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
});

const devices = {};
async function getDevices() {
	const res = await pool.query({ rowMode: 'array',
		text: 'SELECT id, key from devices'});
	for(const row of res.rows)
		devices[row[1]] = row[0];
	global.log(`devices auth keys: ${Object.keys(devices).join()}`);
}
getDevices();

const FIELDS = {
	data: {
		t: 'temperature',
		p: 'pressure',
		h: 'humidity',
		st1: 'soil_temp_1',
		st2: 'soil_temp_2',
		sm1: 'soil_moisture_1',
		sm2: 'soil_moisture_2',
		wt1: 'wire_temp_1',
		wt2: 'wire_temp_2'
	}
};

function authorize(key) {
	return devices[key] || false;
}

function validateData(data, type) {
	const result = {};
	for(const f in FIELDS[type]) {
		const val = parseFloat(data[f]);
		if(!val || isNaN(val))
			return false;
		result[FIELDS[type][f]] = val;
	}
	return result;
}

module.exports.validateData = validateData;
module.exports.authorize = authorize;
module.exports.pool = pool;
