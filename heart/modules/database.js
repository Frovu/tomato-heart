const Pool = require('pg').Pool;
const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
});

const FIELDS = [
	'temperature',
	'pressure',
	'humidity'
];

function validateData(data) {
	for(const f of FIELDS)
		if(!(f in data) || isNaN(parseFloat(data[f])))
			return false;
	return true;
}

module.exports.validateData = validateData;
module.exports.fields = FIELDS;
module.exports.query = pool.query;
