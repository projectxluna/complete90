var mongoose = require('mongoose');

var schema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    forPlayers: {
        type: [mongoose.Schema.Types.ObjectId],
        index: true,
    },
    forTeams: {
        type: [mongoose.Schema.Types.ObjectId],
        index: true,
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    }
},
{
    timestamps: true,
    collection: 'user_assignment'
});

module.exports = mongoose.model('Assignment', schema);
