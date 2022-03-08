require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./_middleware/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// api routes
app.get('/', (req, res, next) => {
    res.send({'message': 'Hello World!'});
    next();
});

app.use('/users', require('./users/users.controller'));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODEJS_DOCKER_PORT || 8080;
server = app.listen(port, '0.0.0.0', () => console.log('Server listening on port ' + port));

module.exports = server;