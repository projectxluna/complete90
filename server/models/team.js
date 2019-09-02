var mongoose = require('mongoose');

var teamSchema = mongoose.Schema({
    name: String,
    managerId: { 
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true
    },
    clubId: { 
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true
    },
},
{
    timestamps: true,
    collection: 'teams'
});

module.exports = mongoose.model('Team', teamSchema);
