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
        var paymentMethodNonce = req.nonce;
        var planId = req.planId;

        User.findById(userId, function (err, user) {
            Payments.createSubscription(paymentMethodNonce, user, planId, function (err, result) {
                if (err) {
                    return res.status(500).send(err);
                }
                user.braintree.customer.id = result.customer.id;
                user.braintree.customer.paymentMethods = result.customer.paymentMethods;
                user.braintree.customer.subscription = result.subscription;

                user.save(function (err, user) {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    res.json({
                        success: true
                    });
                });
            });
        });
    });
};
