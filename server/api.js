module.exports = function (app) {
    var User = require('./models/user');
    var express = require('express');
    var jwt = require('jsonwebtoken');
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

        newUser.save().then(function (user) {
            res.json({
                success: true
            });
        }).catch(function (err) {
            if (!err) {
                return res.json({
                    success: false,
                    message: "Signup failed. Please try again"
                });
            }
            return res.json({
                success: false,
                message: err.errmsg,
                code: err.code
            });
        });
    });

    apiRoutes.post('/forgot_pasword', function (req, res) {
        /**
         * check if we even have that email in the db
         * then generate the reset email
         */
        User.findOne({
            'local.email': req.body.email
        }, function (err, user) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            }
            if (!user) {
                res.json({ success: false, message: 'Email not recognized' });
            } else if (user) {
                // do the work
                res.json({ success: true, message: 'check your email' });
            }
        });
    });

    apiRoutes.post('/reset_password', function (req, res) {
        /**
         * check if the token passed is not expired
         * take the new password and hash
         */
        User.findOne({
            'local.email': req.body.email
        }, function (err, user) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            }
            if (!user) {
                res.json({ success: false, message: 'Email not recognized' });
            } else if (user) {
                // do the work
                res.json({ success: true, message: 'new password' });
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
