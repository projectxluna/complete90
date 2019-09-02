var mongoose = require('mongoose');

var clubSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: { 
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true
    },
    logoUrl: {
        type: String
    },
    teams: {
        type: [mongoose.Schema.Types.ObjectId]
    }
},
{
    timestamps: true,
    collection: 'clubs'
});

module.exports = mongoose.model('Club', clubSchema);
