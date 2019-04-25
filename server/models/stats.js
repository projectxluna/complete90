// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var statSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true
    },
    content: {
        id: {
            type: String,
            index: true,
            required: true
        },
        currentTime: Number,
        watchedTotal: Number,
        contentLength: Number
    },
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
    }
},
{
    timestamps: true,
    collection: 'user_stats'
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Stats', statSchema);
