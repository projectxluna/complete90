'use strict';

(function () {
    var UserHelper = (function () {
        var UserHelper = function () { };

        UserHelper.prototype.exposedData = function (user) {
            let cleanUser = {
                name: user.name,
                email: user.email,
                coach: user.hasCoachSubscription(),
                subscription: user.braintree.subscription || user.subscription,
                creditCards: user.braintree.creditCards,
                avatarURL: user.avatarURL || "/public/imgs/profile/cropped5ac0f4d48a2a273cd5f7b71a1526154727.jpg",
                teamName: user.teamName,
                companyname: user.companyname
            }
            if (!user.hasCoachSubscription()) {
                cleanUser.height = user.height;
                cleanUser.position = user.position;
                cleanUser.foot = user.foot;
            }
            return cleanUser;
        }

        return UserHelper;
    })();

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = new UserHelper();
    } else {
        window.Mailer = new UserHelper();
    }
})();
