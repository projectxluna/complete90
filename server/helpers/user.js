'use strict';

(function () {
    var UserHelper = (function () {
        var UserHelper = function () { };

        UserHelper.prototype.exposedData = function (user) {
            let cleanUser = {
                name: user.name,
                email: user.email,
                coach: user.coach,
                avatarURL: user.avatarURL
            }
            if (!user.coach) {
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
