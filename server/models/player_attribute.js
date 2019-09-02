var mongoose = require('mongoose');

var schema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true
    },
    tag: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        index: true,
    }
},
{
    timestamps: true,
    collection: 'player_attributes'
});

module.exports = mongoose.model('PlayerAttribute', schema);
