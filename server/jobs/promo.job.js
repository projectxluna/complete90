var cron = require('cron');
var User = require('../models/user');

function callback() {
    try {
        User.find({
            promo_code: {
                $exists: true,
                $ne: null || undefined
            }
        }, (err, users) => {
            if (err) {
                console.error(err);
            }
            if (users) {
                users.forEach(user => {
                    if (subscriptionLeft(user.subscription) === 0) {
                        let updateUser = {
                            subscription: null,
                            promo_code: null
                        }
                        User.findOneAndUpdate({ _id: user._id }, updateUser, (err, upsert) => {
                            if (err) {
                                return console.error(err);
                            }
                            console.log('Promo Deactivated For User:', user._id, ', Promo Code: ', user.promo_code);
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.error(error);
    }
}

function subscriptionLeft(subscription) {
    if (!subscription) {
        return 0;
    }
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var firstDate = new Date(subscription.nextBillingDate);
    var secondDate = new Date();

    let daysLeft = firstDate.getTime() - secondDate.getTime();
    return (daysLeft > 0) ? Math.round( daysLeft / oneDay) : 0;
}

var PromoJob = {
    register: function () {
        var cronJob = cron.job('0 */12 * * 0-6', callback); // For prod. Every 12 hrs
        // var cronJob = cron.job('0-59 * * * *', callback); // For Dev. Runs every 1 minute
        cronJob.start();
    }
}
module.exports = PromoJob;
