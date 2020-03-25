const {
    exposedUserData,
    exposedClubData,
    PROFILES,
    createClub,
    updateClub
} = require('./helpers/pure');
const User = require('./models/user');
const Club = require('./models/club');
const SignupPromo = require('./models/signup_promo');
const mongoose = require('mongoose');

module.exports = function (app) {
    var mailer = require('./helpers/mailer');
    var express = require('express');
    var jwt = require('jsonwebtoken');
    var waterfall = require('async-waterfall');
    var crypto = require('crypto');
    var apiRoutes = express.Router();
    var Auth = require('./helpers/auth');

    var config = require('./config').get(process.env.NODE_ENV);
    var mcConfig = config.mailChimp;

    var Mailchimp = require('mailchimp-api-v3')
    var mailchimp = new Mailchimp(mcConfig.API_KEY);

    var randomize = require('randomatic');

    // un-authenticated routes
    apiRoutes.post('/login', (req, res) => {
            User.findOne({
                email: req.body.email
            }, (err, user) => {
                if (err || !user) {
                    return res.json({
                        success: false,
                        message: err || 'Authentication failed'
                    });
                }
                if (!user.validPassword(req.body.password)) {
                    res.json({ success: false, message: 'Authentication failed' });
                } else {
                    var payload = {
                        userId: user._id,
                        name: user.name
                    }
                    var token = jwt.sign(payload, app.get('superSecret'), {
                        expiresIn: 86400 * 7 // expires in 1 week. *Note: add some sort of auto renewal
                    });

                    Club.findOne({owner: user._id}, (err, club) => {
                        var ret = {
                            success: true,
                            token: token,
                            user: exposedUserData(user),
                            club: exposedClubData(club)
                        }
                        if (user.clubStatus && ret.club) {
                            ret.club.status = user.clubStatus;
                        }
                        res.json(ret);
                    });
                }
            });
    });

    apiRoutes.post('/contactus', (req, res) => {
        var from = req.body.from;
        var name = req.body.name;
        var message = req.body.message;

        var data = {
            to: 'support@thecomplete90.com',
            from: mailer.email,
            template: 'contact-form',
            subject: 'New Contact Request',
            context: {
                message: message,
                name: name,
                from: from
            }
        };

        mailer.smtpTransport().sendMail(data, (err) => {
            if (!err) {
                return res.json({
                    success: true
                });
            } else {
                console.log(err);
                return res.json({
                    success: false
                });
            }
        });
    });


    apiRoutes.post('/getSignupPromo', (req, res) => {
        //console.log(req.body.code);
        SignupPromo.findOne({"code": ""+req.body.code, 'activated': false}, (err, club) => {
            if(club) {
                return res.json({
                    success: true,
                    club: club
                });
            } else {
                return res.json({
                    success: false,
                    club: undefined
                });
            }
        });
    });

    apiRoutes.post('/clubSignup', (req, res) => {

        var newPromo = new SignupPromo();
       
        newPromo.code = 'cm90' + randomize('*', 4);
        newPromo.profileType = 'MANAGER';
        newPromo.club = req.body.club['_id'];
        newPromo.activated = false;
        newPromo.save();



        var from = 'support@thecomplete90.com';
        var name = 'The Complete 90';
        var message = "Send this email to coach for signup. <a href='https://staging.thecomplete90.com/coach_signup?id="+newPromo.code+"'>" ;

        var data = {
            to: req.body.email,
            from: mailer.email,
            template: 'contact-form',
            subject: 'Coach Signup Form',
            context: {
                message: message,
                name: name,
                from: from
            }
        };

        mailer.smtpTransport().sendMail(data, (err) => {
            if (!err) {
                return res.json({
                    success: true
                });
            } else {
                console.log(err);
                return res.json({
                    success: false
                });
            }
        });
    });


    apiRoutes.post('/getClubs', (req, res) => {
        Club.find({}, function(err, clubs) {
            if (err) {
                return res.json({
                    success: false,
                    message: "Something went wrong!"
                });
            }

            var clubsMapped = {};
        
            clubs.forEach(function(club, index) {
                clubsMapped[index] = club;
            });
        
            return res.json({
                success: true,
                clubs: clubsMapped
            }); 
        });
    });

    apiRoutes.post('/createClubs', (req, res) => {
        var club = new Club({name: req.body.clubName, email: req.body.email, phoneNumber: req.body.phone, owner: mongoose.Types.ObjectId(req.body.userId)})
        club.save(async (err, club) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            res.json({
                id: club._id,
                success: true
            });
        });


    });


    apiRoutes.post('/signup', (req, res) => {
        var newUser = new User();
        newUser.name = req.body.name;
        newUser.email = req.body.email;
        newUser.postalcode = req.body.postalcode;
        newUser.address = req.body.address;
        if (!req.body.isManager) {
            newUser.clubId = req.body.clubId;
            newUser.clubStatus = req.body.clubStatus;
            newUser.teamId = req.body.teamId;
        }
        newUser.password = newUser.generateHash(req.body.password);
        newUser.profiles.push(req.body.isManager ? PROFILES.MANAGER : PROFILES.PLAYER);

        try {
            User.findOne({
                email: newUser.email
            }, (err, found) => {
                if (found || err) {
                    return res.json({
                        success: false,
                        message: err || 'Email already exists!'
                    });
                }
                try {
                    newUser.save(async (err, user) => {
                        if (err) {
                            console.log(err)
                            return reject(err);
                        }
                        res.json({
                            success: true
                        });
                        var name = req.body.name.split(' ');
                        var listId;

                        if (req.body.isManager === true) {
                            //await createClub(req.body.clubName, user._id);
                            await updateClub(req.body.clubId, user._id);
                            listId = mcConfig.COACH_SIGN_UP_LIST;
                        } else {
                            listId = mcConfig.SIGN_UP_LIST;
                        }

                        mailchimp.post('/lists/' + listId + '/members', {
                            email_address: req.body.email,
                            status: 'subscribed',
                            merge_fields: {
                                'FNAME': name[0],
                                'LNAME': name[1]
                            }
                        }).catch(err => {
                            console.error(err);
                        });
                    });
                } catch (e) {
                    console.log(e);
                    return res.json({
                        success: false,
                        message: e
                    });
                }
            });
        } catch (err) {
            console.log(err)
            return res.json({
                success: false,
                message: err
            });
        }
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
                    subject: 'THE Complete 90 Password help has arrived!',
                    context: {
                        url: 'https://thecomplete90.com/forgot?token=' + token,
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
                                subject: 'THE Complete 90 Password Reset Confirmation',
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
                    var data = {
                        to: user.email,
                        from: mailer.email,
                        template: 'reset-password-email',
                        subject: 'THE Complete 90 Password Reset Confirmation',
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
    require('./club.route')(apiRoutes);
    require('./user.route')(apiRoutes);
    require('./report.route')(apiRoutes);

    app.use('/api', apiRoutes);
};
