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
            Promo.findOne({ code: code }, (err, promo) => {
                if (err || !promo) {
                    return reject({
                        err: err || 'Promo code not found'
                    });
                }
                User.find({ promo_code: code }, (err, users) => {
                    if (!users || err) {
                        return reject({
                            err: err || 'Promo code already in use'
                        });
                    }
                    if (promo.max_use && users.length >= promo.max_use) {
                        return reject({
                            err: "Sorry the promo code you've entered is no longer valid"
                        });
                    }
                    resolve(promo);
                });
            });
        });
    },
    subscriptionLeft: subscriptionLeft
}
module.exports = PromoController;
