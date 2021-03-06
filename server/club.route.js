const Auth = require('./helpers/auth');
const Club = require('./models/club');
const Team = require('./models/team');
const User = require('./models/user');
const mongoose = require('mongoose');
const path = require('path');
const im = require('imagemagick');
const { exposedUserData, CLUB_REQUEST_STATUS } = require('./helpers/pure');
const SignupPromo = require('./models/signup_promo');


module.exports = function (apiRoutes) {
    var mailer = require('./helpers/mailer');
    var randomize = require('randomatic');
    var config = require('./config').get(process.env.NODE_ENV);
    var md5 = require('md5');
    var mcConfig = config.mailChimp;

    var Mailchimp = require('mailchimp-api-v3')
    var mailchimp = new Mailchimp(mcConfig.API_KEY);

    const findTeamPlayer = (teamId) => {
        return new Promise((resolve, reject) => {
            User.find({teamId: mongoose.Types.ObjectId(teamId)}, (err, users) => {
                if (err) return reject(err);
                let cleanedUsers = users.map(user => exposedUserData(user));
                resolve(cleanedUsers);
            });
        });
    }

    const findClubLike = (clubName) => {
        return Club.find({name: new RegExp(clubName, 'i')}).lean().exec();
    }

    const findUser = (userId) => {
        return User.findById(userId).lean().exec();
    }

    apiRoutes.get('/club', Auth.isAuthenticated, async (req, res) => {
        const { clubName } = req.query;
        if (!clubName) {
            return res.status(422).send({
                message: 'Invalid param: club name is required'
            });
        }
        let clubs = await findClubLike(clubName);

        let clubsMapped = [];
        await Promise.all(clubs.map(async club => {
            
            for(i = 0; i < club.owner.length; i++) {          
                let owner = await findUser(club.owner[i]);
                if (owner) {
                    club.managerName = owner.name;
                    club.managerId = owner._id;
                }
                if (!club.logoUrl) {
                    club.logoUrl = '/public/imgs/clubs/default.png'
                }
                clubClone = Object.assign({}, club);
                clubsMapped.push(clubClone);
            }
        }));

        res.json({
            success: true,
            clubs: clubsMapped
        });
    });

    apiRoutes.put('/club', Auth.isAuthenticated, (req, res) => {
        const { name, clubId } = req.body;
        let ownerId = req.decoded.userId;

        if (!clubId || !name) {
            return res.status(422).send({success: false, message: 'Invalid Params'});
        }

        Club.findOneAndUpdate({owner: mongoose.Types.ObjectId(ownerId), _id: mongoose.Types.ObjectId(clubId)}, {
            name: name
        }, (err, club) => {
            if (err) {
                return res.json({success: false, err: err});
            }
            return res.json({success: true});
        });
    });

    apiRoutes.get('/club/pending-request', Auth.isAuthenticated, (req, res) => {
        let userId = req.decoded.userId;
        Club.findOne({owner: mongoose.Types.ObjectId(userId)}, (err, club) => {
            if (err || !club) {
                return res.status(422).send({
                    message: err
                });
            }
            User.find({clubId: club._id, managerId: userId, clubStatus: CLUB_REQUEST_STATUS.PENDING }, (err, users) => {
                if (err) {
                    return res.status(422).send({
                        message: err
                    });
                }
                res.json({
                    success: true,
                    pendingUsers: users.map(user => {
                        return {
                            id: user._id,
                            name: user.name,
                            email: user.email,
                            subscription: user.braintree.subscription || user.subscription,
                            avatarURL: user.avatarURL || '/public/imgs/profile/cropped5ac0f4d48a2a273cd5f7b71a1526154727.jpg',
                        }
                    })
                });
            });
        });
    });

    apiRoutes.post('/club/confirm-request', Auth.isAuthenticated, (req, res) => {
        let ownerId = req.decoded.userId;
        const {userId} = req.body;
        Club.findOne({owner: mongoose.Types.ObjectId(ownerId)}, (err, club) => {
            if (err || !club) {
                return res.status(422).send({
                    message: err
                });
            }
            User.findOneAndUpdate({_id: mongoose.Types.ObjectId(userId)}, { clubStatus: CLUB_REQUEST_STATUS.ACTIVE }, (err, saved) => {
                if (err) {
                    return res.status(422).send({
                        message: err
                    });
                }
                res.json({
                    success: true
                });
            });
        });
    });


    function loopThroughEmails (counter, email) {
        mailchimp.post(automation[counter], {
            email_address: email,
        }).then(function (newResult) {
            console.log("Success 3");
            sent = true;
        }).catch(err => {
            console.log("Fail 1");
            console.error(err);
        });  
    }
    
    apiRoutes.post('/club/team', Auth.isAuthenticated, (req, res) => {
        let ownerId = req.decoded.userId;
        var newPromo = new SignupPromo();
        var code = "";
        const {teamName} = req.body;
        if (!teamName) {
            return res.status(422).send({
                message: 'Invalid Param: Team name is required'
            });
        }
        Club.findOne({owner: mongoose.Types.ObjectId(ownerId)}, (err, club) => {
            if (err) {
                return res.status(422).send({
                    message: err
                });
            }
            let team = new Team();
            team.name = teamName;
            team.managerId = mongoose.Types.ObjectId(ownerId);
            team.clubId = club._id;
            
            team.save((err, team) => {
                if (err) {
                    return res.status(422).send({
                        message: err
                    });
                }
                res.json({
                    success: true
                });
                
                if (team) {
                    let teams = club.teams || [];
                    teams.push(team._id);
                    
                    Club.findOneAndUpdate({_id: club._id}, {teams: teams}, (err, cb) =>{
                        // console.log('updated club with new team id')
                    });


                    //console.log("Team ID: ", team._id);
                    
                    newPromo.code = 'cm90' + randomize('Aa0', 4);
                    newPromo.profileType = 'PLAYER';
                    newPromo.club = club._id;
                    newPromo.teamId = mongoose.Types.ObjectId(team._id);
                    newPromo.activated = false;
                    team_name = team.name;
                    newPromo.save();

                    
                    listId = mcConfig.PLAYER_LIST;
                    var automation = ['/automations/697ef73121/emails/1e5b51e876/queue', '/automations/697ef73121/emails/cc09160d15/queue','/automations/697ef73121/emails/2e6a28e7d9/queue', '/automations/697ef73121/emails/ebd72bf198/queue', '/automations/697ef73121/emails/40f44b8687/queue', '/automations/697ef73121/emails/30b0c9ec9a/queue', '/automations/697ef73121/emails/a75650d693/queue', '/automations/697ef73121/emails/9f196e0371/queue', '/automations/697ef73121/emails/e4df96bb25/queue', '/automations/697ef73121/emails/ad665d32ac/queue','/automations/697ef73121/emails/74b092cc6a/queue'];
                    var sent = false;
                    User.findOne({_id: mongoose.Types.ObjectId(ownerId)}, (err, user) => {

                        // mailchimp.delete('/lists/' + listId + '/members/' + md5(user.email)).catch(err => {
                        //     console.error(err);
                        // });


                        mailchimp.get('/lists/' + listId + '/members/' + md5(user.email)
                        ).then(function (result) {
                            //console.log("Succuess 1");
                            // If already subscribed coach then update team name and code
                            var from = 'The Complete 90';
                            var name = 'The Complete 90';
                            var message = '<body style="background-color: #FAFAFA; margin: 0; padding: 0"><header style="position: fixed; background-color: rgba(244,244,244,.95); top: 0; left: 0; width: 100%; height: 46px; box-shadow: 0 2px 2px 0 rgba(0,0,0,.2); line-height: 46px; min-width: 815px;"></header><div class="outer-container"><div class="page-container" style=" background-color: white; margin:90px auto 0px auto; width: 600px;"><div style="text-align: center;"><img src="https://mcusercontent.com/18e4ef69694befc5389a215f1/images/a2617c88-044d-408a-97ea-f907794e15a6.png" height="200px; margin:auto;"></div><div style=" padding: 18px;"><h3 class="heading" style="font-weight:700; line-height: 24px; color: #202020; font-size:20px; font-family: Helvetica; padding-top: 10px;">Coach The Complete 90 has invited you to join their team</h3><div style="text-align: center;"><p style="font-size:16px; line-height: 24px; font-family: Helvetica; color: #202020;font-weight: 400; padding-bottom: 35px; padding-top: 10px;">Please follow the link below to create your players account</p><a href="https://thecomplete90.com/coach_signup?id='+newPromo["code"]+'" style="font-size: 16px; padding: 18px; font-family: Arial; background-color: #C20834; color: white; text-align: center; font-weight: bold; text-decoration: none;border-radius: 5px;">Create Account</a></div><h3 style="font-weight:700; line-height: 24px; color: #202020; font-size:18px; font-family: Helvetica; padding-top: 50px;">Get familiar with the platform by reading the instructions below to learn how to ...</h3><ul style="padding-top: 30px; padding-bottom: 60px;"><li style="font-size: 16px; font-family:Helvetica; color: #202020; line-height: 24px; font-weight: 400; ">Personalize Your Account</li><li style="font-size: 16px; font-family:Helvetica; color: #202020; line-height: 24px; font-weight: 400; ">Navigate the Exercise Library</li><li style="font-size: 16px; font-family:Helvetica; color: #202020; line-height: 24px; font-weight: 400; ">Create Personalized Sessions</li><li style="font-size: 16px; font-family:Helvetica; color: #202020; line-height: 24px; font-weight: 400; ">Complete Assignments</li><li style="font-size: 16px; font-family:Helvetica; color: #202020; line-height: 24px; font-weight: 400; ">Improve Player Attributes</li><li style="font-size: 16px; font-family:Helvetica; color: #202020; line-height: 24px; font-weight: 400; ">Compete on the Leaderboard</li></ul><div style="text-align: center; "><a href="#" style="font-size: 16px; padding: 18px; font-family: Arial; background-color: #C20834; color: white; text-align: center; font-weight: bold; text-decoration: none;border-radius: 5px;">View Full Instructions Here</a></div></div><div style="background-color: #1F2934; padding:25px 18px; margin-top: 70px;"><div style="border-bottom: 2px solid white;"><ul style="justify-content: space-between; width: 135px; margin: auto; padding-left: 0; text-align: center; padding-bottom: 30px; display: flex;" ><li style="list-style: none; height:25px; width: 25px; background-color: #E4405F; border-radius: 100%; text-align: center; "><a href="#" style="color: white; display: block; "><img src="https://ci3.googleusercontent.com/proxy/Kxmv_VOWHxRbx9ha8NMR9nONZZkGxv2vyrUOlpQhi5_ieDBEPqRomk1Twd6kvqAcUM1ccGIxTgC8Rh1TvQcdKf-Ql5F87HSw4DKkcKIdL9Gz-WFmaHDWBrvzjPHt2CVn=s0-d-e1-ft#https://cdn-images.mailchimp.com/icons/social-block-v2/color-instagram-48.png" alt="Instagram" style="display:block;border:0;height:auto;outline:none;text-decoration:none" height="24" width="24" class="CToWUd"></a></li><li style="list-style: none; height: 25px; width: 25px; background-color: #54BE93; border-radius: 100%; text-align: center; "><a href="#" style="color: white; display: block;"><img src="https://ci5.googleusercontent.com/proxy/FR4I0VM10pxcUwbQ63iIF6cAOqyzEbM1yC4ru84XQ1cT1RbvvmtJzUt4RdH1WUB452ecisGFRwh877ppJp5BhUmQhUWIABs5JUY80JFlBF08huivKdmS6R-dPg=s0-d-e1-ft#https://cdn-images.mailchimp.com/icons/social-block-v2/color-link-48.png" alt="Website" style="display:block;border:0;height:auto;outline:none;text-decoration:none" height="24" width="24" class="CToWUd"></a></li><li style="list-style: none; height: 25px; width: 25px; background-color: #537BBE; border-radius: 100%; text-align: center; "><a href="#" style="color: white; display: block;"><img src="https://ci5.googleusercontent.com/proxy/KLWDyxU_2JT5nOGTE6_NSp-hT37kpCU8B8HLih6GyBnhKJEvCDQsIeq4uLfJ7CQWsSCfpfcbCXVh74IrAuFYiXcU4R2sPN1CInMYwE7DpPIiYM9dGmBbl7FrtmeFZ6I=s0-d-e1-ft#https://cdn-images.mailchimp.com/icons/social-block-v2/color-facebook-48.png" alt="Facebook" style="display:block;border:0;height:auto;outline:none;text-decoration:none" height="24" width="24" class="CToWUd"></a></li></ul></div><div style="text-align: center;"><p style="color: white; font-style: italic; font-size: 12px; line-height: 24px; font-family: Helvetica;padding-top: 25px; padding-bottom: 30px;">Copyright © 2020 The Complete 90, All rights reserved.</p></div></div></div></div></body>';

                            console.log(message);
                
                
                   
                            var data = {
                                to: user.email,
                                from: mailer.email,
                                template: 'contact-form',
                                subject: 'Join our team ' + team_name,
                                html: message,
                                // context: {
                                //     message: message,
                                //     name: name,
                                //     from: from
                                // }
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
                     

                            // mailchimp.patch('/lists/' + listId + '/members/' + md5(user.email), {
                            //     status: 'subscribed',
                            //     merge_fields: {
                            //         'TEAM': team_name,
                            //         'CODE': newPromo.code
                            //     }
                            // }).then(function (updateResult) {
                            //     console.log("Succuess 2");
                            //     //Send email to coach with new team and code
                            //     automation.forEach(function(url, i){
                            //         if(sent == false) {
                            //             mailchimp.post(url, {
                            //                 email_address: user.email,
                            //             }).then(function (newResult) {
                            //                 console.log("Success 3");
                            //                 sent = true;
                            //             }).catch(err => {
                            //                 console.log("Fail: ", i);
                            //                 //console.error(err);
                            //             });  
                            //         }
                            //     });
                                       
                            //     //}

                            // }).catch(err => {
                            //     console.log("Fail 2");
                            //     console.error(err);
                            // });
                        }).catch(function (err) {
                            console.log("API Error: ", err);
                            //if user not subscribed add him to list
                            mailchimp.post('/lists/' + listId + '/members', {
                                email_address: user.email,
                                status: 'subscribed',
                                merge_fields: {
                                    'FNAME': user.name,
                                    'CODE': newPromo.code,
                                    'TEAM': team_name,
                                }
                            }).catch(err => {
                                console.error(err);
                            });
                        });
                    });
                }
            });


            // var from = 'support@thecomplete90.com';
            // var name = 'The Complete 90';
            // var message = "Send this email to player for signup. <a href='http://thecomplete90.com/coach_signup?id="+newPromo.code+"'>" ;


            // User.findOne({_id: mongoose.Types.ObjectId(ownerId)}, (err, user) => {
            //     var data = {
            //         to: user.email,
            //         from: mailer.email,
            //         template: 'contact-form',
            //         subject: 'Coach Signup Form',
            //         context: {
            //             message: message,
            //             name: name,
            //             from: from
            //         }
            //     };
    
            //     mailer.smtpTransport().sendMail(data, (err) => {
            //         if (!err) {
            //             return res.json({
            //                 success: true
            //             });
            //         } else {
            //             console.log(err);
            //             return res.json({
            //                 success: false
            //             });
            //         }
            //     });
            // });
            



        });
    });




    apiRoutes.post('/club/resendTeamEmail', Auth.isAuthenticated, (req, res) => {
        let ownerId = req.decoded.userId;
        var teamId = req.body.team['_id'];
        let team = new Team();
    
        listId = mcConfig.PLAYER_LIST;
        console.log("Team Id: ", teamId);
        var sent = false;
        SignupPromo.findOne({teamId: mongoose.Types.ObjectId(teamId)}, (err, newPromo) => {
            console.log('newPromo: ', newPromo);
            Team.findOne({_id: mongoose.Types.ObjectId(teamId)}, (err, team) => {
                console.log('team: ', team);
                User.findOne({_id: mongoose.Types.ObjectId(ownerId)}, (err, user) => {
                    console.log('user: ', user);
                    var from = 'The Complete 90';
                    var name = 'The Complete 90';

                    var message = '<body style="background-color: #FAFAFA; margin: 0; padding: 0"><header style="position: fixed; background-color: rgba(244,244,244,.95); top: 0; left: 0; width: 100%; height: 46px; box-shadow: 0 2px 2px 0 rgba(0,0,0,.2); line-height: 46px; min-width: 815px;"></header><div class="outer-container"><div class="page-container" style=" background-color: white; margin:90px auto 0px auto; width: 600px;"><div style="text-align: center;"><img src="https://mcusercontent.com/18e4ef69694befc5389a215f1/images/a2617c88-044d-408a-97ea-f907794e15a6.png" height="200px; margin:auto;"></div><div style=" padding: 18px;"><h3 class="heading" style="font-weight:700; line-height: 24px; color: #202020; font-size:20px; font-family: Helvetica; padding-top: 10px;">Coach The Complete 90 has invited you to join their team</h3><div style="text-align: center;"><p style="font-size:16px; line-height: 24px; font-family: Helvetica; color: #202020;font-weight: 400; padding-bottom: 35px; padding-top: 10px;">Please follow the link below to create your players account</p><a href="https://thecomplete90.com/coach_signup?id='+newPromo["code"]+'" style="font-size: 16px; padding: 18px; font-family: Arial; background-color: #C20834; color: white; text-align: center; font-weight: bold; text-decoration: none;border-radius: 5px;">Create Account</a></div><h3 style="font-weight:700; line-height: 24px; color: #202020; font-size:18px; font-family: Helvetica; padding-top: 50px;">Get familiar with the platform by reading the instructions below to learn how to ...</h3><ul style="padding-top: 30px; padding-bottom: 60px;"><li style="font-size: 16px; font-family:Helvetica; color: #202020; line-height: 24px; font-weight: 400; ">Personalize Your Account</li><li style="font-size: 16px; font-family:Helvetica; color: #202020; line-height: 24px; font-weight: 400; ">Navigate the Exercise Library</li><li style="font-size: 16px; font-family:Helvetica; color: #202020; line-height: 24px; font-weight: 400; ">Create Personalized Sessions</li><li style="font-size: 16px; font-family:Helvetica; color: #202020; line-height: 24px; font-weight: 400; ">Complete Assignments</li><li style="font-size: 16px; font-family:Helvetica; color: #202020; line-height: 24px; font-weight: 400; ">Improve Player Attributes</li><li style="font-size: 16px; font-family:Helvetica; color: #202020; line-height: 24px; font-weight: 400; ">Compete on the Leaderboard</li></ul><div style="text-align: center; "><a href="#" style="font-size: 16px; padding: 18px; font-family: Arial; background-color: #C20834; color: white; text-align: center; font-weight: bold; text-decoration: none;border-radius: 5px;">View Full Instructions Here</a></div></div><div style="background-color: #1F2934; padding:25px 18px; margin-top: 70px;"><div style="border-bottom: 2px solid white;"><ul style="justify-content: space-between; width: 135px; margin: auto; padding-left: 0; text-align: center; padding-bottom: 30px; display: flex;" ><li style="list-style: none; height:25px; width: 25px; background-color: #E4405F; border-radius: 100%; text-align: center; "><a href="#" style="color: white; display: block; "><img src="https://ci3.googleusercontent.com/proxy/Kxmv_VOWHxRbx9ha8NMR9nONZZkGxv2vyrUOlpQhi5_ieDBEPqRomk1Twd6kvqAcUM1ccGIxTgC8Rh1TvQcdKf-Ql5F87HSw4DKkcKIdL9Gz-WFmaHDWBrvzjPHt2CVn=s0-d-e1-ft#https://cdn-images.mailchimp.com/icons/social-block-v2/color-instagram-48.png" alt="Instagram" style="display:block;border:0;height:auto;outline:none;text-decoration:none" height="24" width="24" class="CToWUd"></a></li><li style="list-style: none; height: 25px; width: 25px; background-color: #54BE93; border-radius: 100%; text-align: center; "><a href="#" style="color: white; display: block;"><img src="https://ci5.googleusercontent.com/proxy/FR4I0VM10pxcUwbQ63iIF6cAOqyzEbM1yC4ru84XQ1cT1RbvvmtJzUt4RdH1WUB452ecisGFRwh877ppJp5BhUmQhUWIABs5JUY80JFlBF08huivKdmS6R-dPg=s0-d-e1-ft#https://cdn-images.mailchimp.com/icons/social-block-v2/color-link-48.png" alt="Website" style="display:block;border:0;height:auto;outline:none;text-decoration:none" height="24" width="24" class="CToWUd"></a></li><li style="list-style: none; height: 25px; width: 25px; background-color: #537BBE; border-radius: 100%; text-align: center; "><a href="#" style="color: white; display: block;"><img src="https://ci5.googleusercontent.com/proxy/KLWDyxU_2JT5nOGTE6_NSp-hT37kpCU8B8HLih6GyBnhKJEvCDQsIeq4uLfJ7CQWsSCfpfcbCXVh74IrAuFYiXcU4R2sPN1CInMYwE7DpPIiYM9dGmBbl7FrtmeFZ6I=s0-d-e1-ft#https://cdn-images.mailchimp.com/icons/social-block-v2/color-facebook-48.png" alt="Facebook" style="display:block;border:0;height:auto;outline:none;text-decoration:none" height="24" width="24" class="CToWUd"></a></li></ul></div><div style="text-align: center;"><p style="color: white; font-style: italic; font-size: 12px; line-height: 24px; font-family: Helvetica;padding-top: 25px; padding-bottom: 30px;">Copyright © 2020 The Complete 90, All rights reserved.</p></div></div></div></div></body>';

                    //console.log(message);


                    //var message = "Send this email to player for signup. http://thecomplete90.com/coach_signup?id="+newPromo.code;


            
                    var data = {
                        to: user.email,
                        from: mailer.email,
                        template: 'contact-form',
                        subject: 'Join our team ' + team.name,
                        html: message, // html body
                        // context: {
                        //     message: message,
                        //     name: name,
                        //     from: from
                        // }
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
            });

        });
    });






    
    apiRoutes.delete('/club/team/player', Auth.isAuthenticated, (req, res) => {
        const {playerId} = req.query;
        User.findByIdAndUpdate(playerId, {$unset: {teamId: ''}}, (err, user) => {
            if (err) return res.json({success: false, err});

            res.json({success: true, user});
        });
    });

    apiRoutes.delete('/club/player', Auth.isAuthenticated, (req, res) => {
        const {playerId} = req.query;
        User.findByIdAndUpdate(playerId, {$unset: {clubId: '', clubStatus: ''}}, (err, user) => {
            if (err) return res.json({success: false, err});

            res.json({success: true, user});
        });
    });

    apiRoutes.get('/club/team/players', Auth.isAuthenticated, async (req, res) => {
        let players = await findTeamPlayer(req.query.teamId);
        res.json({
            success: true,
            players: players
        });
    });

    apiRoutes.get('/club/teams', Auth.isAuthenticated, async (req, res) => {
        let userId = req.decoded.userId;
        let teams  = await Team.find({managerId: mongoose.Types.ObjectId(userId)}).exec();

        res.json({
            success: true,
            teams: teams
        });

    });

    apiRoutes.get('/club/no-teams', Auth.isAuthenticated, (req, res) => {
        let userId = req.decoded.userId;
        Club.findOne({owner: mongoose.Types.ObjectId(userId)}, (err, club) => {
            if (err || !club) {
                return res.status(422).send({
                    message: err
                });
            }
            console.log(club);
            User.find({
                //email: "playertest23@hotmail.com",
                clubId: mongoose.Types.ObjectId(club._id),
                clubStatus: CLUB_REQUEST_STATUS.ACTIVE,
                $or: [
                    {teamId: {$exists: false}},
                    {teamId: {$eq: null}}
                ]
            }, (err, users) => {
                if (err) {
                    return res.status(422).send({
                        message: err
                    });
                }
                //console.log("Users: ", users);
                let cleanedUsers = users.map(user => exposedUserData(user))
                res.json({
                    success: true,
                    users: cleanedUsers
                });
            });
        });
    });

    apiRoutes.put('/club/team', Auth.isAuthenticated, (req, res) => {
        const {id, name} = req.body;
        Team.findByIdAndUpdate(id, {name: name}, (err, team) => {
            if (err) return res.json({success: false, err});
            res.json({success: true})
        });
    });

    apiRoutes.delete('/club/team', Auth.isAuthenticated, (req, res) => {
        const {teamId} = req.query;
        Team.deleteOne({_id: mongoose.Types.ObjectId(teamId)}, (err, result) => {
            if (err) return res.json({success: false, err});
            User.updateMany({teamId: mongoose.Types.ObjectId(teamId)}, {$unset: {teamId: ''}, $set: {clubStatus: CLUB_REQUEST_STATUS.PENDING}}, (err, result) => {
                res.json({success: true});
            });
        });
    });

    apiRoutes.post('/club/join-team', Auth.isAuthenticated, (req, res) => {
        const { playerId, teamId } = req.body;
        if (!playerId || !teamId) {
            return res.status(422).send({
                message: 'Invalid param: club id is required'
            });
        }
        Team.findById(mongoose.Types.ObjectId(teamId), (err, team) => {
            if (err) {
                return res.status(422).send({
                    message: err
                });
            }
            User.findOneAndUpdate({_id: mongoose.Types.ObjectId(playerId)}, {teamId: team._id}, (err, user) => {
                if (err) {
                    return res.status(422).send({
                        message: err
                    });
                }
                res.json({
                    success: true,
                    user: exposedUserData(user)
                });
            });
        });
    });

    apiRoutes.post('/club/join', Auth.isAuthenticated, (req, res) => {
        // console.log("Body: ", req.body;
        var clubIdd  = req.body.clubId;
        var managerId  = req.body.managerId;
        let userId = req.decoded.userId;
        // if (!clubId) {
        //     return res.status(422).send({
        //         message: 'Invalid param: club id is required'
        //     });
        // }
        Club.findById(mongoose.Types.ObjectId(clubIdd), (err, club) => {
            if (err) {
                return res.status(422).send({
                    message: err
                });
            }
            // console.log("Club Id", clubIdd);
            // console.log("Club", club);

            User.findOneAndUpdate({_id: mongoose.Types.ObjectId(userId)}, {clubId: club._id, managerId: managerId, clubStatus: 'PENDING'}, (err, user) => {
                if (err) {
                    return res.status(422).send({
                        message: err
                    });
                }
                res.json({
                    success: true
                });
            });
        });
    });

    /**
     * upload user image
     */
    apiRoutes.post('/club/club-img', Auth.isAuthenticated, function (req, res) {
        if (!req.files) return res.status(400).send('No files were uploaded.');
        const {clubImg} = req.files;
        const {clubId} = req.body;
        let userId = req.decoded.userId;

        let ext = '.' + (clubImg.name.split('.')[1]) || '.jpg';
        let imgname = userId + Math.round(new Date().getTime() / 1000) + ext;
        let imgPath = path.join(__dirname, '/../public/imgs/clubs/');

        // resize and store image on the server
        // maybe store on s3 later
        im.crop({
            srcData: clubImg.data,
            dstPath: imgPath + imgname,
            width: 300,
            height: 300,
            quality: 1,
            gravity: 'Center'
        }, function (err, stdout, stderr) {
            if (err) return res.status(500).send(err);

            Club.findOneAndUpdate({ _id: mongoose.Types.ObjectId(clubId), owner: mongoose.Types.ObjectId(userId)},
                { logoUrl: '/public/imgs/clubs/' + imgname },
                { upsert: true, new: true }, (err, club) => {
                    if (err) return res.status(500).send(err);

                    try {
                        res.json({
                            success: true,
                            club
                        });
                    } catch (error) {
                        res.json({
                            success: false,
                            message: error
                        });
                    }
                });
        });
    });
}
