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
            let owner = await findUser(club.owner);
            if (owner) {
                club.managerName = owner.name;
            }
            if (!club.logoUrl) {
                club.logoUrl = '/public/imgs/clubs/default.png'
            }
            clubsMapped.push(club);
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
            User.find({clubId: club._id, clubStatus: CLUB_REQUEST_STATUS.PENDING }, (err, users) => {
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
    
    apiRoutes.post('/club/team', Auth.isAuthenticated, (req, res) => {
        let ownerId = req.decoded.userId;
        var newPromo = new SignupPromo();
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
                        console.log('updated club with new team id')
                    });


                    //console.log("Team ID: ", team._id);
                    
                    newPromo.code = 'cm90' + randomize('*', 4);
                    newPromo.profileType = 'PLAYER';
                    newPromo.club = club._id;
                    newPromo.teamId = mongoose.Types.ObjectId(team._id);
                    newPromo.activated = false;
                    newPromo.save();
                }
            });
            


            // var from = 'support@thecomplete90.com';
            // var name = 'The Complete 90';
            // var message = "Send this email to player for signup. <a href='https://staging.thecomplete90.com/coach_signup?id="+newPromo.code+"'>" ;


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
                console.log("Users: ", users);
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
        const { clubId } = req.body;
        let userId = req.decoded.userId;
        if (!clubId) {
            return res.status(422).send({
                message: 'Invalid param: club id is required'
            });
        }
        Club.findById(mongoose.Types.ObjectId(clubId), (err, club) => {
            if (err) {
                return res.status(422).send({
                    message: err
                });
            }
            User.findOneAndUpdate({_id: mongoose.Types.ObjectId(userId)}, {clubId: club._id, clubStatus: 'PENDING'}, (err, user) => {
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
