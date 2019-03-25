var mongoose = require('mongoose');

var teamSchema = mongoose.Schema({
    name: String,
    managerId: { 
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true
    },
},
{
    timestamps: true,
    collection: 'clubs'
});

module.exports = mongoose.model('Team', teamSchema);
