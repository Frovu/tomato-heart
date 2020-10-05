
const fs = require('fs');
const filename = './settings.json';
const crypto = require('crypto');

const defaults = require('./settings_default.json');
const settings = fs.existsSync(filename) ?
    require(filename) : Object.assign({}, defaults);

module.exports.check = (sum) => sum === settings.sum;

module.exports.default = defaults;
module.exports.get = () => settings;

const save = () =>
    fs.writeFileSync(filename, JSON.stringify(settings, null, 2), 'utf8');

module.exports.update = (changes) => {
    Object.assign(settings.settings, changes);
    settings.sum = crypto.createHash('md5')
        .update(JSON.stringify(settings.settings))
        .digest('hex');
    save();
    return settings;
}
