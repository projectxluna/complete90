const mongoose = require('mongoose');
const { PROFILE_TYPE } = require('../helpers/pure');

var promoSchema = mongoose.Schema({
    code: {
        type: String,
        index: true
    },
    profileType: {
        type: PROFILE_TYPE
    },
    values: [{}],
    owner: { 
        type: mongoose.Schema.Types.ObjectId,
        index: true,
    },
    maxUse: Number,
    validFrom: Date,
    validTo: Date,
},
{
    timestamps: true,
    collection: 'promo_code'
});

module.exports = mongoose.model('Promo', promoSchema);
