module.exports = function (apiRoutes) {
    const Payments = require('./helpers/payment');
    var waterfall = require('async-waterfall');
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
                res.json({success: false, err});
            }
        });
    });

    apiRoutes.post('/braintree/subsribe', function (req, res) {
        let userId = req.decoded.userId 
        let paymentMethodNonce = req.nonce;
        let planId = req.planId;
        
        User.findOne({ _id: userId }, function (err, user) {
            if (err) return res.status(500).send(err);
            //Save payment methods
            
            //Create subscription
            Payments.createSubscription(paymentMethodNonce, user, function(result) {
                //save response 
            });
        });

        
        
    });
};
