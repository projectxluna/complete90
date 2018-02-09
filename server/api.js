module.exports = function (app) {
    var User = require('./models/user');
    var mailer = require('./mailer');
    var express = require('express');
    var jwt = require('jsonwebtoken');
    var waterfall = require('async-waterfall');
    var crypto = require('crypto');
    var apiRoutes = express.Router();

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
                        token: token
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
                                    return res.json({ success: true});
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

    apiRoutes.use(function (req, res, next) {
        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers['x-access-token'];

        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, app.get('superSecret'), function (err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    });

    // authenticated routes
    apiRoutes.get('/', function (req, res) {
        res.json({
            success: true,
            message: 'Welcome to the complete 90',
            version: process.env.npm_package_version
        });
    });

    require('./user.route')(apiRoutes);
    app.use('/api', apiRoutes);
};
