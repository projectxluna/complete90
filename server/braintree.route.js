module.exports = function (apiRoutes) {
    const Payments = require('./helpers/payment');
    const Auth = require('./helpers/auth');
    var User = require('./models/user');

    /**
     * get client token
     */
    apiRoutes.get('/braintree/subsribe', function (req, res) {
        var response = {};
        Payments.getClientToken(function (token) {
            if (token) {
                response.token = token;
                Payments.getPlansAvailable(function (plans) {
                    if (plans) {
                        response.success = true;
                        response.plans = plans;
                        res.json(response);
                    }
                });
            } else {
                res.json({ success: false, err });
            }
        });
    });

    /**
     * get the payment cards
     */
    apiRoutes.get('/braintree/paymentmethods', Auth.isAuthenticated, function (req, res) {

    });

    /**
     * create new subscription
     */
    apiRoutes.post('/braintree/subsribe', Auth.isAuthenticated, function (req, res) {
        var userId = req.decoded.userId
        var paymentPayload = req.body.paymentPayload;
        var planId = req.body.planId;

        User.findById(userId, function (err, user) {
            Payments.createSubscription(paymentPayload, user, planId, function (err, result) {
                if (err) {
                    return res.status(500).send(err);
                }
                if (result.subscription.success) {
                    delete result.subscription.descriptor;
                    delete result.subscription.transactions;
                    delete result.subscription.statusHistory;
                    delete result.subscription.getGateway;
                    delete result.subscription.success;

                    user.braintree.id = result.customer.id;
                    user.braintree.paymentMethods = result.customer.paymentMethods;
                    user.braintree.creditCards = result.customer.creditCards;
                    user.subscription = result.subscription;

                    user.save()
                        .then(function (user) {
                            res.json({
                                success: true
                            });
                        }).catch(function (err) {
                            if (err) {
                                return res.status(500).send(err);
                            }
                        });
                }
            });
        });
    });
};
