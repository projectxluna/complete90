var env = require('./env.json');
var braintree = require('braintree');
var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: env.BT_MERCHANT_ID,
    publicKey: env.BT_PUBLIC_KEY,
    privateKey: env.BT_PRIVATE_KEY
});

var paymentController = {
    getClientToken: function (callback) {
        gateway.clientToken.generate({}, function (err, response) {
            if (err) {
                callback(err)
            }
            if (response.clientToken) {
                callback(response.clientToken)
            } else {
                callback(response)
            }
        });

    },
    getPlansAvailable: function (callback) {
        gateway.plan.all(function (err, response) {
            if (err) {
                callback(err)
            }
            if (response.plans) {
                callback(response.plans)
            } else {
                callback(response)
            }
        });
    },
    createSubscription: function (nonce, user, callback) {
        gateway.customer.create({
            firstName: user.firstName,
            lastName: user.lastName,
            paymentMethodNonce: nonce
        }, function (err, result) {
            if (result.success) {
                var response = {};
                response.customer = result;
                var token = result.customer.paymentMethods[0].token;
                gateway.subscription.create({
                    paymentMethodToken: token,
                    planId: plan
                }, function (err, result) {
                    response.subscription = result;
                    callback(response);
                });
            } else {
                callback(undefined);
            }
        });
    }
    
}
module.exports = paymentController;
