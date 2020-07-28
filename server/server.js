var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var morgan = require('morgan');
var mongoose = require('mongoose');
var mongodb = require('mongodb');
var config = require('./config').get(process.env.NODE_ENV);
var path = require('path');
var PromoJob = require('./jobs/promo.job');
var TopPlayerJob = require('./jobs/top_player.job');
var PlayerAttributeJob = require('./jobs/player_attribute.job');
var port = process.env.PORT || 9000;

// mongoose config
const options = {
    useMongoClient: true,
    autoIndex: true, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    promiseLibrary: global.Promise
};
// mongoose.set('debug', true);

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
app.use('/public', express.static(path.join(__dirname, '/../public')));
app.use(express.static(path.join(__dirname, '/../dist')));

// API location
require('./api.js')(app);

// Send all other requests to the Angular app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/../dist/index.html'));
});

PromoJob.register();
PlayerAttributeJob.register();
TopPlayerJob.register();
app.listen(port);
