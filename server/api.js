module.exports = function (app) {
    var User = require('./models/user');
    var mailer = require('./helpers/mailer');
    var express = require('express');
    var jwt = require('jsonwebtoken');
    var waterfall = require('async-waterfall');
    var crypto = require('crypto');
    var apiRoutes = express.Router();
    var Auth = require('./helpers/auth');
    const userHelper = require('./helpers/user');

    // un-authenticated routes
    apiRoutes.post('/login', function (req, res) {
        User.findOne({
            'email': req.body.email
        }, function (err, user) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            }

            if (!user) {
                res.json({ success: false, message: 'Authentication failed. User not found.' });
            } else if (user) {
                if (!user.validPassword(req.body.password)) {
                    res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                } else {
                    var payload = {
                        userId: user._id,
                        name: user.name
                    }
                    var token = jwt.sign(payload, app.get('superSecret'), {
                        expiresIn: 86400 * 7 // expires in 1 week. *Note: add some sort of auto renewal
                    });

                    res.json({
                        success: true,
                        token: token,
                        profile: userHelper.exposedData(user)
                    });
                }
            }
        });
    });

    apiRoutes.post('/signup', function (req, res) {
        var newUser = new User();
        newUser.name = req.body.name;
        newUser.email = req.body.email;
        newUser.password = newUser.generateHash(req.body.password);

        newUser.save(function (err, user) {
            if (err) {
                return res.json({
                    success: false,
                    message: err.errmsg,
                    code: err.code
                });
            }
            res.json({
                success: true
            });
        });
    });

    apiRoutes.post('/forgot_pasword', function (req, res) {
        waterfall([
            /**
             * check if we even have that email in the db
             * then generate the reset email
             * */
            function (next) {
                User.findOne({
                    'email': req.body.email
                }, function (err, user) {
                    if (user) {
                        next(err, user)
                    } else {
                        next('Email not found');
                    }
                });
            },
            function (user, next) {
                // create the random token
                crypto.randomBytes(20, function (err, buffer) {
                    var token = buffer.toString('hex');
                    next(err, user, token);
                });
            },
            function (user, token, next) {
                User.findByIdAndUpdate(
                    { _id: user._id },
                    {
                        resetPasswordToken: token,
                        resetPasswordExpires: Date.now() + 86400000
                    },
                    {
                        upsert: true,
                        new: true
                    },
                    function (err, new_user) {
                        next(err, token, new_user);
                    });
            },
            function (token, user, next) {
                var data = {
                    to: user.email,
                    from: mailer.email,
                    template: 'forgot-password-email',
                    subject: 'Password help has arrived!',
                    context: {
                        url: 'http://localhost:9000/forgot?token=' + token,
                        name: user.name.split(' ')[0]
                    }
                };

                mailer.smtpTransport().sendMail(data, function (err) {
                    if (!err) {
                        return res.json({
                            success: true,
                            message: 'Kindly check your email for further instructions'
                        });
                    } else {
                        return next(err);
                    }
                });
            }
        ], function (err, result) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            }
        });
    });

    apiRoutes.post('/reset_password', function (req, res) {
        /**
         * check if the token passed is not expired
         * take the new password and hash
         */
        User.findOne({
            resetPasswordToken: req.body.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        }, function (err, user) {
            if (err) {
                return res.status(422).send({
                    success: false,
                    message: err
                });
            }
            if (!user) {
                res.status(400).send({ success: false, message: 'Password reset token is invalid or has expired' });
            } else if (user) {
                if (req.body.newPassword === req.body.verifyPassword) {
                    user.password = user.generateHash(req.body.newPassword);
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
                    user.save(function (err) {
                        if (err) {
                            return res.status(422).send({
                                message: err
                            });
                        } else {
                            var data = {
                                to: user.email,
                                from: mailer.email,
                                template: 'reset-password-email',
                                subject: 'Password Reset Confirmation',
                                context: {
                                    name: user.name.split(' ')[0]
                                }
                            };

                            mailer.smtpTransport().sendMail(data, function (err) {
                                if (!err) {
                                    return res.json({ success: true });
                                } else {
                                    return res.status(422).send({
                                        message: err
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    });

    apiRoutes.post('/update_password', Auth.isAuthenticated, function (req, res) {
        User.findOne({ _id: req.decoded.userId }, function (err, user) {
            if (err) return res.status(500).send(err);

            let oldPassword = req.body.oldPassword;
            let newPassword = req.body.newPassword;
            let verifyPassword = req.body.verifyPassword;

            if (req.body.newPassword !== req.body.verifyPassword || !user.validPassword(oldPassword)) {
                return res.json({ success: false, message: 'Failed to update password' });
            }

            user.password = user.generateHash(newPassword);
            user.save(function (err) {
                if (err) {
                    return res.status(422).send({
                        message: err
                    });
                } else {
                    return res.json({ success: true });
                    // var data = {
                    //     to: user.email,
                    //     from: mailer.email,
                    //     template: 'reset-password-email',
                    //     subject: 'Password Reset Confirmation',
                    //     context: {
                    //         name: user.name.split(' ')[0]
                    //     }
                    // };

                    // mailer.smtpTransport().sendMail(data, function (err) {
                    //     if (!err) {
                    //         return res.json({ success: true });
                    //     } else {
                    //         return res.status(422).send({
                    //             message: err
                    //         });
                    //     }
                    // });
                }
            });
        });
    });

    // authenticated routes
    apiRoutes.get('/', Auth.isAuthenticated, function (req, res) {
        res.json({
            success: true,
            message: 'Welcome to the complete 90',
            version: process.env.npm_package_version
        });
    });
    require('./braintree.route')(apiRoutes);
    require('./contents.route')(apiRoutes);
    require('./user.route')(apiRoutes);

    app.use('/api', apiRoutes);
};
