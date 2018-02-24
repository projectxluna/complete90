var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('./config');
var path = require('path');

var port = process.env.PORT || 9000;

// mongoose config
const options = {
    useMongoClient: true,
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    promiseLibrary: global.Promise
};

// connect to database
mongoose.connect(config.database, options,function (err) {
    if (err) console.error(err);
});

// secret variable
app.set('superSecret', config.secret);

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

// Angular DIST output folder
app.use(express.static(path.join(__dirname, '/../dist')));

app.use(express.static(path.join(__dirname, '/../public')));

// API location
require('./api.js')(app);

// Send all other requests to the Angular app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/../dist/index.html'));
});

app.listen(port);
