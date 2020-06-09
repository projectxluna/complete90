var config = require('../config').get(process.env.NODE_ENV);
var braintree = require('braintree');
var btConfig = config.braintree;

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'dev') {
    btConfig.environment = braintree.Environment.Production;
} else {
    btConfig.environment = braintree.Environment.Production;
}

var gateway = braintree.connect(btConfig);

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
               // console.log(response.plans);
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
            //console.log("Restul: ", paymentMethod.nonce);
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
    upgradeSubscription: function (subscriptionId, upgradeTo, callback) {
        //Update Membership
        gateway.subscription.update(subscriptionId, {
            planId: upgradeTo,
            price: "25.00"
          }, function (err, result) {
            if (err) {
                callback(err);
                return;
            }else {
                var response = {};
                console.log("Update Membership: ", result);
                response.subscription = result;
                callback(undefined, response);
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
