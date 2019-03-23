// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var planSchema = mongoose.Schema({
    name: String,
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true
    },
    content: {
        type: [String]
    },
    detailedContent: {
        type: [{}]
    }
},
{
    timestamps: true,
    collection: 'user_plans'
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Plan', planSchema);
