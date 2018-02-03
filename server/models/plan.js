// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var planSchema = mongoose.Schema({
    title: String,
    author: Schema.Types.ObjectId,
    contents: [String]
},
{
    timestamps: true,
    collection: 'user_plans'
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Plan', plansSchema);
