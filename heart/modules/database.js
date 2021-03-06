const Pool = require('pg').Pool;
const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
});
const EVENTS_CACHE = process.env.EVENTS_CACHE || 5;

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

// cache last data from devices
const last = {};

function authorize(key) {
	return key && devices[key] || false;
}

function validateData(data, type) {
	if (type === 'data') {
		const result = {};
		for(const f in FIELDS[type]) {
			if(!data[f]) continue; // FIXME: For now allow partitial data prob disable later
			const val = parseFloat(data[f]);
			if(!val || isNaN(val))
				return false;
			result[FIELDS[type][f]] = val;
		}
		return Object.keys(result).length ? result : false;
	} else if (type === 'event') {
		return (typeof data.msg === 'string' &&
			(typeof data.val === 'undefined' || typeof data.val === 'boolean'))
			? {msg: data.msg, val: data.val} : false;
	} else {
		throw new Error('Unknown validate type');
	}
}

async function insert(devId, data, type) {
	if (type === 'data') {
		let i=1;
		const fields = Object.keys(data);
		const q = `INSERT INTO data (dev, ${fields.join(', ')}) VALUES ($1,${fields.map(()=>`$${++i}`).join(',')})`;
		await pool.query(q, [devId].concat(Object.values(data)));
	} else if (type === 'event') {
		const valExists = typeof data.val !== 'undefined';
		const q = `INSERT INTO events(devId, message${valExists?',value':''}) VALUES ($1,$2${valExists?',$3':''})`;
		await pool.query(q, [devId, data.msg].concat(valExists?[data.val]:[]));
	} else {
		throw new Error('Unknown insert type');
	}
	if(!last[devId]) last[devId] = {};
	data.at = new Date();
	if(type === 'data') {
		last[devId][type] = data;
	} else {
		if(!last[devId][type]) last[devId][type] = [];
		last[devId][type].push(data);
		if(last[devId][type].length > EVENTS_CACHE) last[devId][type].pop(0);
	}
}

async function get(params) {
	const fields = typeof params.fields !== 'string' ? []
		: params.fields.split(',').reduce((a, f) => FIELDS.data[f] ? a.concat([FIELDS.data[f]]) : a, []);
	if(!fields.length) return null;
	const from = params.from && parseInt(params.from);
	const to = params.to && parseInt(params.to);
	if((from && (isNaN(from) || from < 0)) || (to && (isNaN(to) || to < 0)))
		return null;
	const q = `SELECT at,${fields.join(',')} FROM data ` + ((from||to)?'WHERE ':'')
		+ (from?`at >= to_timestamp(${from}) `:'') + (to?(from?'AND ':'') + `at < to_timestamp(${to})`:'');
	try {
		const res = await pool.query({ rowMode: 'array', text: q});
		return {
			rows: res.rows,
			fields: res.fields.map(f => f.name)
		};
	} catch (e) {
		return null;
	}
}

module.exports.validateData = validateData;
module.exports.authorize = authorize;
module.exports.insert = insert;
module.exports.last = last;
module.exports.get = get;
// module.exports.pool = pool;
