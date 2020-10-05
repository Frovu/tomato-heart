const express = require('express');
const bodyParser = require('body-parser');

const config = {
    port: 3050
};

// define global logging function
const logStream = require('fs').createWriteStream('./log.log', {flags:'a'});
global.log = (msg) => {
    console.log(msg);
    logStream.write(`[${new Date().toISOString().replace(/\..+/g, '')}] ${msg}\n`);
};

const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support url-encoded

app.use(express.static('static'));

app.use('/heart', require('./heart.js'));
app.use('/user',  require('./user.js'));

app.listen(config.port, () => global.log(`listening to port ${config.port}`));
