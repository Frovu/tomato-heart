const logStream = require('fs').createWriteStream('./log.log', {flags:'a'});

module.exports = (msg) => {
	console.log(msg);
	logStream.write(`[${new Date().toISOString().replace(/\..+/g, '')}] ${msg}\n`);
};
