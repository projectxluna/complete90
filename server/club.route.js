const Auth = require('./helpers/auth');
const Club = require('./models/club');
const Team = require('./models/team');
const User = require('./models/user');
const mongoose = require('mongoose');
const _ = require('lodash')
const { exposedClubData, exposedUserData, CLUB_REQUEST_STATUS } = require('./helpers/pure');

module.exports = function (apiRoutes) {

    apiRoutes.get('/club', Auth.isAuthenticated, (req, res) => {
        const { clubName } = req.query;
        if (!clubName) {
            return res.status(422).send({
                message: 'Invalid param: club name is required'
            });
        }
        Club.find({name: new RegExp('^'+clubName+'$', "i")}, (err, clubs) => {
            if (err) {
                return res.status(422).send({
                    message: err
                });
            }
            let clubsMapped = clubs.map(club => {
                return exposedClubData(club);
            });
            res.json({
                success: true,
                clubs: clubsMapped
            });
        });
    });

    apiRoutes.get('/club/pending-request', Auth.isAuthenticated, (req, res) => {
        let userId = req.decoded.userId;
        Club.findOne({owner: mongoose.Types.ObjectId(userId)}, (err, club) => {
            if (err) {
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
                            avatarURL: user.avatarURL || "/public/imgs/profile/cropped5ac0f4d48a2a273cd5f7b71a1526154727.jpg",
                        }
                    })
                });
            });
        });
    });

    const findTeamPlayer = (teamId) => {
        return new Promise((resolve, reject) => {
            User.find({teamId: mongoose.Types.ObjectId(teamId)}, (err, users) => {
                if (err) return reject(err);
                let cleanedUsers = users.map(user => exposedUserData(user));
                resolve(cleanedUsers);
            });
        });
    }

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
            if (err) {
                return res.status(422).send({
                    message: err
                });
            }
            User.find({
                clubId: club._id,
                clubStatus: CLUB_REQUEST_STATUS.ACTIVE,
                teamId: {
                    $exists: false,
                    $eq: null || undefined
                }
            }, (err, users) => {
                if (err) {
                    return res.status(422).send({
                        message: err
                    });
                }
                let cleanedUsers = users.map(user => exposedUserData(user))
                res.json({
                    success: true,
                    users: cleanedUsers
                });
            });
        });
    });

    apiRoutes.post('/club/confirm-request', Auth.isAuthenticated, (req, res) => {
        let ownerId = req.decoded.userId;
        const {userId} = req.body;
        Club.findOne({owner: mongoose.Types.ObjectId(ownerId)}, (err, club) => {
            if (err) {
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

    apiRoutes.post('/club/new-team', Auth.isAuthenticated, (req, res) => {
        let ownerId = req.decoded.userId;
        const {teamName} = req.body
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
                }
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
}
