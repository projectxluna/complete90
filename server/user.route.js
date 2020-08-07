const { exposedUserData, exposedClubData } = require('./helpers/pure');
const path = require('path');
const Club = require('./models/club');
const Team = require('./models/team');
const User = require('./models/user');
const Assignment = require('./models/assignment');
const PlayerAttributes = require('./models/player_attribute');
const mongoose = require('mongoose');

const findClub = (ownerId) => {
    return new Promise((resolve, reject) => {
        Club.findOne({owner: ownerId}, (err, club) => {
            if (err) console.log(err);
            resolve(club);
        });
    });
}

const findClubById = (id) => {
    return new Promise((resolve, reject) => {
        Club.findById(id, (err, club) => {
            if (err) console.log(err);
            resolve(club);
        });
    });
}

const findTeamById = (id) => {
    return Team.findById(id).lean().exec();
}

const findTeamByIds = (ids) => {
    return Team.find({_id: {$in: ids} }).lean().exec();
}

const findUserByIds = (ids) => {
    return User.find({_id: {$in: ids} }).lean().exec();
}

const findManager = (id) => {
    return User.findById(id).lean().exec();
}

const getAssignment = (userId, teamId) => {
    return new Promise((resolve, reject) => {
        let query = {
            $or: [{forPlayers: mongoose.Types.ObjectId(userId)}]
        }
        if (teamId) {
            query.$or.push({
                forTeams: mongoose.Types.ObjectId(teamId)
            });
        }
        Assignment.find(query).sort({ _id: -1}).lean().exec((error, assignments) => {
            if (error) console.error(error)
            resolve(assignments)
        });
    });
}

module.exports = function (apiRoutes) {
    var Auth = require('./helpers/auth');
    var im = require('imagemagick');
    var PromoController = require('./helpers/promo');
    var mailer = require('./helpers/mailer');

    /**
     * get user profile
     */
    apiRoutes.get('/user/me', Auth.isAuthenticated, (req, res) => {
        User.findOne({ _id: req.decoded.userId }, async (err, user) => {
            if (err) return res.status(500).send(err);

            let club;
            let teams;
            if (user.clubId) {
                club = await findClubById(user.clubId);
                if (club && user.teamId) {
                    teams = club.teams.filter(teamId => { return teamId == user.teamId.toString() });
                }
            } else {
                club = await findClub(user._id);
            }
            try {
                let ret = {
                    success: true,
                    user: exposedUserData(user),
                    club: exposedClubData(club)
                }
                if (teams) {
                    ret.club.teams = undefined;
                    let team = await findTeamById(teams[0]);
                    if (team) {
                        let manager = await findManager(team.managerId);
                        team.managerName = manager.name;
                        ret.club.team = team;
                        ret.assignments = await getAssignment(req.decoded.userId, team._id);
                    }
                }
                if (user.clubStatus) {
                    ret.club.status = user.clubStatus;
                }
                res.json(ret);
            } catch (error) {
                res.json({success: false, message: error});
            }
        });
    });

    /**
     * Update user profile
     */
    apiRoutes.post('/user/me', Auth.isAuthenticated, function (req, res) {
        let name = req.body.name;
        let nationality = req.body.nationality;
        let playerProfile = req.body.playerProfile;
        let coachProfile = req.body.coachProfile;

        var update = {};
        var profiles = []
        if (name) update.name = name;
        if (nationality) update.nationality = nationality;
        if (playerProfile) profiles.push(playerProfile);
        if (coachProfile) profiles.push(coachProfile);
        if (profiles.length) update.profiles = profiles;

        User.findOneAndUpdate({ _id: req.decoded.userId }, update,
            {
                upsert: true,
                new: true
            }, function (err, user) {
                if (err) return res.status(500).send(err);
                try {
                    res.json({
                        success: true,
                        user: exposedUserData(user)
                    });
                } catch (error) {
                    res.json({success: false, message: error});
                }
            });
    });

    /**
     * Activate Promo Code
     */
    apiRoutes.post('/user/promo/activate', Auth.isAuthenticated, function (req, res) {
        let code = req.body.code;
        PromoController.validate(code).then(promo => {
            let update = {
                promo_code: promo.code,
                subscription: promo.values[0]
            }
            User.findOneAndUpdate({ _id: req.decoded.userId }, update, function (err, user) {
                    if (err) return res.status(500).send(err);
                    try {
                        res.json({ success: true });

                        var data = {
                            to: 'support@thecomplete90.com',
                            from: mailer.email,
                            template: 'promo-code-activated',
                            subject: 'The Complete 90 Promo Code Activation',
                            context: {
                                code: code,
                                name: user.name,
                                email: user.email
                            }
                        };

                        mailer.smtpTransport().sendMail(data, function (err) {
                            if (err) {
                                console.error(err);
                            }
                        });
                    } catch (error) {
                        // res.json({ success: false, message: error });
                    }
                });
        }).catch(err => {
            res.json({success: false, message: err});
        });
    });

    /**
     * Get assignments
     */
    apiRoutes.get('/user/assignment', Auth.isAuthenticated, (req, res) => {
        const userId = req.decoded.userId;
        const planId = req.query.planId;
        
        let search = {
            userId: userId
        };
        if (planId) {
            search.planId = planId;
        }
        Assignment.find(search).lean().exec(async (err, assignments) => {
            if (err) return res.status(400).send(err);

            let playersId = [];
            let teamsId = [];
            assignments.forEach(a => {
                teamsId.push(...a.forTeams);
                playersId.push(...a.forPlayers);
            });
            let teams = await findTeamByIds(teamsId);
            let players = await findUserByIds(playersId);

            let mappedAssignment = assignments.map(assignment => {
                assignment.forPlayers = assignment.forPlayers.map(playerId => {
                    return players.find(player => {return player._id == playerId}).name;
                });
                return assignment;
            })
            res.json({
                success: true,
                assignments: mappedAssignment
            });
        });
    });

    /**
     * Create assignment
     */
    apiRoutes.post('/user/assignment', Auth.isAuthenticated, function (req, res) {
        const {forTeams, forPlayers, planId, startDate, endDate} = req.body;
        const userId = req.decoded.userId
        
        if (!forTeams && !forPlayers) return res.json({success: false, message: 'player or team required'});
        if (!planId) return res.json({success: false, message: 'plan required'});

        let assignment = new Assignment();
        assignment.userId = userId;
        assignment.planId = planId;
        assignment.forTeams = forTeams;
        assignment.forPlayers = forPlayers;
        assignment.startDate = startDate
        assignment.endDate = endDate;

        assignment.save((err, saved) => {
            if (err) return res.json({success: false, message: err});
            res.json({success: true});
        });
    });

    /**
     * Get player attributes
     */
    apiRoutes.get('/user/attributes', Auth.isAuthenticated, (req, res) => {
        const userId = req.decoded.userId;

        PlayerAttributes.find({
            userId: mongoose.Types.ObjectId(userId),
        }).exec((err, playerAttributes) => {
            if (err) return res.status(400).send(err);

            res.json({
                success: true,
                attributes: playerAttributes
            });
        });
    });

    /**
     * upload user image
     */
    apiRoutes.post('/user/profile-img', Auth.isAuthenticated, function (req, res) {
        if (!req.files) return res.status(400).send('No files were uploaded.');

        let profileImg = req.files.profileImg;
        let ext = '.' + (profileImg.name.split('.')[1]) || '.jpg';
        let imgname = req.decoded.userId + Math.round(new Date().getTime() / 1000) + ext;
        let imgPath = path.join(__dirname, '/../public/imgs/profile/');

        // resize and store image on the server
        // maybe store on s3 later
        im.crop({
            srcData: profileImg.data,
            dstPath: imgPath + imgname,
            width: 300,
            height: 300,
            quality: 1,
            gravity: 'Center'
        }, function (err, stdout, stderr) {
            if (err) return res.status(500).send(err);

            User.findByIdAndUpdate(
                { _id: req.decoded.userId },
                { avatarURL: '/public/imgs/profile/' + imgname },
                { upsert: true, new: true },
                function (err, new_user) {
                    if (err) return res.status(500).send(err);

                    try {
                        res.json({
                            success: true,
                            user: exposedUserData(new_user)
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
};
