var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var config      = require('./config');
var path        = require('path');

var port = process.env.PORT || 9000;

// connect to database
mongoose.connect(config.database, {
    useMongoClient: true
});

mongoose.Promise = global.Promise;

// secret variable
app.set('superSecret', config.secret);

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: false }));

// Angular DIST output folder
app.use(express.static(path.join(__dirname, '/../dist')));

// API location
require('./api.js')(app);

// Send all other requests to the Angular app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/../dist/index.html'));
});

app.listen(port);
