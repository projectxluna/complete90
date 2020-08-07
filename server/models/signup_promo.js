const mongoose = require('mongoose');
const { PROFILE_TYPE } = require('../helpers/pure');

var signupPromoSchema = mongoose.Schema({
    code: {
        type: String,
        index: true
    },
    club: {
        type: mongoose.Schema.Types.ObjectId,
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    profileType: {
        type: String
    },
    activated: {
        type: Boolean
    }
},
{
    timestamps: true,
    collection: 'signup_promo'
});

module.exports = mongoose.model('SignupPromo', signupPromoSchema);
