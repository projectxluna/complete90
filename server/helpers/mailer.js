'use strict';

(function () {
    var Mailer = (function () {
        const hbs = require('nodemailer-express-handlebars');
        const nodemailer = require('nodemailer');
        const path = require('path');
        var config = require('../config').get(process.env.NODE_ENV);
        const email = config.mailer.EMAIL_ID;
        const pass = config.mailer.PASSWORD //remember to turn off secure app in gmail

        var smtpTransport = nodemailer.createTransport({
            service: config.mailer.SERVICE_PROVIDER,
            secure: false,
            auth: {
                user: email,
                pass: pass
            }
        });
        var smtpTransport2 = nodemailer.createTransport({
            service: config.mailer.SERVICE_PROVIDER,
            secure: false,
            auth: {
                user: email,
                pass: pass
            }
        });

        var handlebarsOptions = {
            viewEngine: 'handlebars',
            viewPath: path.join(__dirname, '../templates/'),
            extName: '.html'
        };

        var Mailer = function () {};

        Mailer.prototype.smtpTransport = function () {
            smtpTransport.use('compile', hbs(handlebarsOptions));
            return smtpTransport;
        }

        Mailer.prototype.smtpTransportPure = function () {
            return smtpTransport2;
        }

        return Mailer;
    })();

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = new Mailer();
    } else {
        window.Mailer = new Mailer();
    }
})();
