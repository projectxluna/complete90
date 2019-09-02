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
    return (daysLeft > 0) ? Math.round(daysLeft / oneDay) : 0;
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
                let maxUse = promo.maxUse || Number.MAX_SAFE_INTEGER;
                let validFrom = promo.validFrom;
                let validTo = promo.validTo;
                let now = Date.now();
                let valid = (validFrom && validTo) ? (validFrom < now && validTo > now) : true;

                User.find({ promo_code: code }, (err, users) => {
                    if (err || !users || users.length >= maxUse || !valid) {
                        return reject({
                            err: err || 'Expired Promo Code'
                        });
                    } else {
                        resolve(promo);
                    }
                });
            });
        });
    },
    subscriptionLeft: subscriptionLeft
}
module.exports = PromoController;
