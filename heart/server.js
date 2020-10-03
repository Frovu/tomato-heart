const express = require('express');
const bodyParser = require('body-parser');

config = {
	port: 3050
}

const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support url-encoded

app.use(express.static('static'));

app.use('/heart', require('heart.js'));
app.use('/user',  require('user.js'));

app.listen(config.port, ()=>log(`listening to port ${config.port}`));
