const express = require('express');
const bodyParser = require('body-parser');
global.log = require('./modules/logging.js');

const config = {
	port: 3050
};

const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support url-encoded

app.use(express.static('public'));

app.use('/heart', require('./routes/heart.js'));
app.use('/user',  require('./routes/user.js'));

app.listen(config.port, () => global.log(`listening to port ${config.port}`));
