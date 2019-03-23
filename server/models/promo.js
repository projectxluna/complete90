var mongoose = require('mongoose');

var promoSchema = mongoose.Schema({
    code: {
        type: String,
        index: true
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
