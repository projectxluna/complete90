// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var statSchema = mongoose.Schema({
    userStats: {

    },
    planStats: {

    } 
},
{
    timestamps: true,
    collection: 'stats'
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Stats', statSchema);
