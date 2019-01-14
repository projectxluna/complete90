var Promo = require('../models/promo');
var User = require('../models/user');

var subscriptionLeft = function (subscription) {
    if (!subscription) {
        return 0;
    }
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var firstDate = new Date(subscription.nextBillingDate);
    var secondDate = new Date();

    let daysLeft = firstDate.getTime() - secondDate.getTime();
    return (daysLeft > 0) ? Math.round( daysLeft / oneDay) : 0;
};

var PromoController = {
    validate: function (code) {
        return new Promise((resolve, reject) => {
            User.findOne({ promo_code: code }, (err, user) => {
                if (user || err) {
                    return reject({
                        err: err || 'Promo code already in use'
                    });
                }
                Promo.findOne({ code: code }, (err, promo) => {
                    if (err || !promo) {
                        return reject({
                            err: err || 'Promo code not found'
                        });
                    }
                    // if (subscriptionLeft(promo.))
                    //We should validate that the promo code has not expired
                    resolve(promo);
                });
            });
        });
    },
    subscriptionLeft: subscriptionLeft
}
module.exports = PromoController;
