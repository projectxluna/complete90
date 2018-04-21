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
                    let sub = {
                        createdAt: result.subscription['subscription'].createdAt,
                        billingDayOfMonth: result.subscription['subscription'].billingDayOfMonth,
                        billingPeriodEndDate: result.subscription['subscription'].billingPeriodEndDate,
                        updatedAt: result.subscription['subscription'].updatedAt,
                        currentBillingCycle: result.subscription['subscription'].currentBillingCycle,
                        firstBillingDate: result.subscription['subscription'].firstBillingDate,
                        id: result.subscription['subscription'].id,   
                        merchantAccountId: result.subscription['subscription'].merchantAccountId,
                        neverExpires: result.subscription['subscription'].neverExpires,
                        nextBillAmount: result.subscription['subscription'].nextBillAmount,
                        nextBillingDate: result.subscription['subscription'].nextBillingDate,
                        paidThroughDate: result.subscription['subscription'].paidThroughDate,
                        planId: result.subscription['subscription'].planId,
                        status: result.subscription['subscription'].status,
                    }

                    user.braintree.id = result.customer.id;
                    user.braintree.paymentMethods = result.customer.paymentMethods;
                    user.braintree.creditCards = result.customer.creditCards;
                    user.braintree.subscription = sub;

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
