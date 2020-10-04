
const fs = require('fs');
const filename = './settings.json';
const crypto = require('crypto');
const md5sum = crypto.createHash('md5');

const defaults = require('./settings_default.json');
const settings = fs.existsSync(filename) ?
    require(filename) : Object.assign({}, defaults);

module.exports.check = (sum) => sum === settings.sum;

module.exports.default = defaults;

const save = () =>
    fs.writeFileSync(filename, JSON.stringify(settings, null, 2), 'utf8');

const update = (changes) => {
    Object.assign(settings, changes);
    settings.sum = md5sum(JSON.stringify(settings.settings));
    save();
}
