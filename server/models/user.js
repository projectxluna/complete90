var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
const { CLUB_REQUEST_STATUS } = require('../helpers/pure');
mongoose.Promise = global.Promise;
var userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true,
    },
    postalcode: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    nationality: String,
    profiles: {
        type: [{}]
    },
    avatarURL: String,
    braintree: {
        id: String,
        paymentMethods : [],
        creditCards: [],
        subscription: {}
    },
    promo_code: String,
    survey: {
        viewed: Boolean,
    },
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
    },
    clubStatus: {
        type: CLUB_REQUEST_STATUS,
        index: true
    },
    // clubId: String,
    // clubStatus: {
    //     type: CLUB_REQUEST_STATUS,
    //     index: true
    // },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
    },
    subscription: Object,
},
{
    timestamps: true,
    collection: 'user_profile'
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.hasCoachSubscription = function() {
    // return true;
    return (this.braintree.subscription && this.braintree.subscription.planId.includes('coach'));
}

module.exports = mongoose.model('User', userSchema);
