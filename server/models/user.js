// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
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
    teamName: String,
    companyName: String,
    height: String,
    position: String,
    foot: String,
    avatarURL: String,
    braintree: {
        id: String,
        paymentMethods : [],
        creditCards: [],
        subscription: {}
    }
},
{
    timestamps: true,
    collection: 'user_profile'
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

/**
 * This should be checking against something in the db!
 */
userSchema.methods.hasCoachSubscription = function() {
    return true;
    // return (this.braintree.subscription && this.braintree.subscription.planId.includes("coach"));
}

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
