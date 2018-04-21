var config = require('../config').get(process.env.NODE_ENV);var braintree = require('braintree');
var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: config.braintree.MERCHANT_ID,
    publicKey: config.braintree.PUBLIC_KEY,
    privateKey: config.braintree.PRIVATE_KEY
});

var paymentController = {
    getClientToken: function (callback) {
        gateway.clientToken.generate({}, function (err, response) {
            if (err) {
                callback(err);
                return;
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
                callback(err);
                return;
            }
            if (response.plans) {
                callback(response.plans)
            } else {
                callback(response)
            }
        });
    },
    createSubscription: function (paymentMethod, user, planId, callback) {
        var name = user.name.split(' ')
        //create the customer
        gateway.customer.create({
            firstName: name[0],
            lastName: name[1],
            email: user.email,
            paymentMethodNonce: paymentMethod.nonce
        }, function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            
            if (result.success) {
                var response = {};
                response.customer = result.customer;
                var token = result.customer.paymentMethods[0].token;
                gateway.subscription.create({
                    paymentMethodToken: token,
                    planId: planId
                }, function (err, result) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    response.subscription = result;
                    callback(undefined, response);
                });
            }
        });
    },
    cancelSubsription: function (subscriptionId, callback) {
        gateway.subscription.cancel(subscriptionId, function (err, result) {
            callback(err, result);
        });
    },
    removePaymentCard: function (customerId, callback) {
        gateway.customer.delete(customerId, function (err) {
            callback(err);
        });
    }

}
module.exports = paymentController;
