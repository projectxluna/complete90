const {
    PROFILES,  
} = require('./helpers/pure');
module.exports = function (apiRoutes) {
    const Payments = require('./helpers/payment');
    const Auth = require('./helpers/auth');
    var User = require('./models/user');

    var config = require('./config').get(process.env.NODE_ENV);
    var mcConfig = config.mailChimp;

    var Mailchimp = require('mailchimp-api-v3')
    var mailchimp = new Mailchimp(mcConfig.API_KEY);

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
    //, Auth.isAuthenticated
    apiRoutes.post('/braintree/subsribe', function (req, res) {
 
        var paymentPayload = req.body.paymentPayload;
        var planId = req.body.planId;
        var newUser = new User();
        newUser.name = req.body.user.name;
        newUser.email = req.body.user.email;
        newUser.postalcode = req.body.user.postalcode;
        newUser.address = req.body.user.address;
        if (!req.body.user.isManager) {
            newUser.clubId = req.body.user.clubId;
            newUser.clubStatus = req.body.user.clubStatus;
            newUser.teamId = req.body.user.teamId;
        }
        newUser.password = newUser.generateHash(req.body.user.password);
        newUser.profiles.push(req.body.user.isManager == 'true' ? PROFILES.MANAGER : PROFILES.PLAYER);

        try {
            User.findOne({
                email: newUser.email
            }, (err, found) => {
                if (found || err) {
                    return res.json({
                        success: false,
                        message: err || 'Email already exists!'
                    });
                }
                try {
                    newUser.save(async (err, user) => {
                        if (err) {
                            console.log(err)
                            return reject(err);
                        }
                        res.json({
                            success: true
                        });
                        var name = req.body.user.name.split(' ');
                        var listId;

                        if (req.body.user.isManager === true) {
                            //await createClub(req.body.clubName, user._id);
                            await updateClub(req.body.user.clubId, user._id);
                            listId = mcConfig.COACH_SIGN_UP_LIST;
                        } else {
                            listId = mcConfig.SIGN_UP_LIST;
                        }


                        

                        // mailchimp.post('/lists/' + listId + '/members', {
                        //     email_address: req.body.user.email,
                        //     status: 'subscribed',
                        //     merge_fields: {
                        //         'FNAME': name[0],
                        //         'LNAME': name[1]
                        //     }
                        // }).catch(err => {
                        //     console.error(err);
                        // });



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
                                //console.log("Subscriotuib: ", sub);
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
                } catch (e) {
                    console.log(e);
                    return res.json({
                        success: false,
                        message: e
                    });
                }
            });
        } catch (err) {
            console.log(err)
            return res.json({
                success: false,
                message: err
            });
        }


     
    });
};
