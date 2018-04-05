'use strict';

(function () {
    var Mailer = (function () {
        const hbs = require('nodemailer-express-handlebars');
        const nodemailer = require('nodemailer');
        const path = require('path');
        const env = require('./env.json');
        const email = env.MAILER_EMAIL_ID;
        const pass = env.MAILER_PASSWORD //remember to turn off secure app in gmail

        var smtpTransport = nodemailer.createTransport({
            service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
            auth: {
                user: email,
                pass: pass
            }
        });

        var handlebarsOptions = {
            viewEngine: 'handlebars',
            viewPath: path.join(__dirname, './templates/'),
            extName: '.html'
        };

        var Mailer = function () {
            smtpTransport.use('compile', hbs(handlebarsOptions));
        };

        Mailer.prototype.smtpTransport = function () {
            return smtpTransport;
        }

        return Mailer;
    })();

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = new Mailer();
    } else {
        window.Mailer = new Mailer();
    }
})();
