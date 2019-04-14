var config = require('./config').get(process.env.NODE_ENV);
var Auth = require('./helpers/auth');
var waterfall = require('async-waterfall');
var request = require('request');
var AWS = require('./helpers/aws');

var Plan = require('./models/plan');
var User = require('./models/user');
var Assignment = require('./models/assignment');
var UserStats = require('./models/stats');
var mongoose = require('mongoose');

module.exports = function (apiRoutes) {

    /**
     * get free sessions
     */
    apiRoutes.get('/free-sessions', function (req, res) {
        waterfall([
            loadFreeSession
        ], function (err, result) {
            if (err) {
                return res.status(422).send({
                    message: err
                });
            }
            res.json({
                success: true,
                content: result
            });
        });
    });

    /**
     * get all sessions
     */
    apiRoutes.get('/sessions', Auth.isAuthenticated, function (req, res) {
        let userId = req.decoded.userId;
        waterfall([
            function (callback) {
                User.findById(userId, function (err, user) {
                    if (!user.braintree.subscription && !user.subscription) {
                        callback('User does not have subscription');
                    } else {
                        callback(null);
                    }
                });
            },
            loadSessions,
            signLinks,
            function (contents, callback) {
                callback(null, contents, userId);
            },
            getUserPlans
        ], function (err, contents, userPlans, managerPlans) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            }
            res.json({
                success: true,
                content: contents,
                plans: userPlans,
                assignments: managerPlans
            });
        });
    });

    /**
     * Add content to session
     */
    apiRoutes.post('/session/content', Auth.isAuthenticated, function (req, res) {
        if (!req.body || !req.body.id || !req.body.contentId) {
            return res.status(422).send({ success: false });
        }
        let id = req.body.id;
        delete req.body.id;
        Plan.findByIdAndUpdate(mongoose.Types.ObjectId(id), {
            '$push': {
                detailedContent: req.body
            }
        }, function (err, plan) {
            if (err) {
                console.log(err);
                return res.json({ success: false, message: err.errmsg, code: err.code });
            }
            res.json({ success: true, id: plan._id });
        });
    });

    /**
     * Delete content from session
     */
    apiRoutes.delete('/session/content', Auth.isAuthenticated, function(req, res) {
        if (!req.body || !req.body.contentId || !req.body.sessionId) {
            return res.status(422).send({ success: false });
        }
        Plan.update({_id: mongoose.Types.ObjectId(req.body.sessionId)}, {
            '$pull': {
                content: {
                    '$in': [req.body.contentId]
                },
                detailedContent: {
                    contentId: req.body.contentId
                }
            }
        }, { multi: true }, function(err, val) {
            if (err) {
                console.log(err);
                return res.json({ success: false, message: err.errmsg, code: err.code });
            }
            res.json({ success: true});
        });
    });

    /**
     * Create/Edit session
     */
    apiRoutes.post('/session', Auth.isAuthenticated, function (req, res) {
        let name = req.body.name;
        let content = req.body.content;
        let userId = req.decoded.userId;
        let sessionId = req.body.id;
 
        if (!name) return res.status(422).send({ success: false });

        if (sessionId) {
            Plan.findByIdAndUpdate(mongoose.Types.ObjectId(sessionId), { name }, function (err, plan) {
                if (err) {
                    console.log(err);
                    return res.json({ success: false, message: err.errmsg, code: err.code });
                }
                console.log('Saved content to session');
                res.json({ success: true, id: plan._id });
            });
        } else {
            let newPlan = new Plan();
            newPlan.name = name;
            newPlan.detailedContent = content;
            newPlan.userId = userId;
            newPlan.save(function (err, plan) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err.errmsg,
                        code: err.code
                    });
                }
                res.json({ success: true, id: plan._id });
            });
        }
    });

    /**
     * Delete training plan
     */
    apiRoutes.delete('/session', Auth.isAuthenticated, function (req, res) {
        Plan.findOneAndRemove({ _id: mongoose.Types.ObjectId(req.body.sessionId) },
            function (err, plan) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err.errmsg,
                        code: err.code
                    });
                }
                res.json({
                    success: true,
                });
            });
    })

    /**
     * get user watched stats
     */
    apiRoutes.get('/session/stats', Auth.isAuthenticated, function (req, res) {
        UserStats.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.decoded.userId)
                }
            },
            {
                $group: {
                    _id: null,
                    watchedTotal: { $sum: '$content.watchedTotal' },
                    count: { $sum: 1 }
                }
            }
        ], function (err, stats) {
            if (err) {
                return res.json({
                    success: false,
                    message: err.errmsg,
                    code: err.code
                });
            }
            if (!stats || stats.length < 1) {
                return res.json({
                    success: true,
                    watchedTotal: 0,
                    viewedTotal: 0
                });
            }
            res.json({
                success: true,
                watchedTotal: stats[0].watchedTotal,
                viewedTotal: stats[0].count
            });
        });
    });

    /**
     * update user watched stats
     */
    apiRoutes.post('/session/stats', Auth.isAuthenticated, function (req, res) {
        let stats = req.body.contentStats;
        let userId = req.decoded.userId;

        UserStats.findOneAndUpdate({ 'userId': userId, 'content.id': stats.contentId }, {
            userId: userId,
            'content.id': stats.contentId,
            'content.currentTime': stats.currentTime,
            $inc: { 'content.watchedTotal': stats.watchedTotal }
        }, { upsert: true }, function (err, numberAffected, raw) {
            if (err) {
                return res.json({
                    success: false,
                    message: err.errmsg,
                    code: err.code
                });
            }
            res.json({
                success: true,
            });
        });
    });

    const findUser = (userId) => {
        return new Promise((resolve, reject) => {
            User.findById(userId, (err, user) => {
                if (err) {
                    reject(err)
                }
                resolve(user)
            })
        });
    }

    apiRoutes.get('/session/leaderboard', Auth.isAuthenticated, (req, res) => {
        const { timestamp, club } = req.body;
        let match = {};
        if (timestamp > 0) {
            match.updatedAt = {
                $gte: Date.now() - timestamp,
            } 
        }
        UserStats.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$userId',
                    userId: { $first: '$userId' },
                    watchedTotal: { $sum: '$content.watchedTotal' },
                    count: { $sum: 1 }
                }
            }
        ], async (err, stats) => {
            if (err) {
                return res.json({
                    success: false,
                    message: err.errmsg,
                    code: err.code
                });
            }
            const pArray = stats.map(async (stat) => {
                let user =  await findUser(stat.userId)
                return {
                    name: user.name,
                    photoUrl: user.avatarURL || '/public/imgs/profile/cropped5ac0f4d48a2a273cd5f7b71a1526154727.jpg',
                    watchedTotal: stat.watchedTotal,
                    count: stat.count
                };
            })
            const mapped = await Promise.all(pArray);
            res.json({
                success: true,
                leaderboard: mapped
            });
        });
    });

    // load free sessions
    function loadFreeSession(callback) {
        var sortSession = function (contentStructure) {
            let freeSessions = contentStructure.sessions.filter(e => {
                return e.free;
            });
            let freeContent = [];
            freeSessions.forEach(session => {
                session.content.forEach(content => {
                    content.group = session.name;
                    content.link = AWS.signUrl(content.link);
                    freeContent.push(content);
                });
            });
            callback(null, freeContent);
        }

        let nodeEnv = process.env.NODE_ENV;
        if (!nodeEnv || nodeEnv === 'development') {
            sortSession(require('../video_structure.json'));
        } else {
            let resourceLocation = config.aws.VIDEO_STRUCTURE;
            request(resourceLocation, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    sortSession(JSON.parse(body))
                }
                else {
                    callback(error);
                }
            });
        }
    }

    // load sessions json structure
    function loadSessions(callback) {
        let nodeEnv = process.env.NODE_ENV;
        if (!nodeEnv || nodeEnv === 'development') {
            callback(null, JSON.stringify(require('../video_structure.json')));
        }
        else {
            let resourceLocation = config.aws.VIDEO_STRUCTURE;
            request(resourceLocation, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(null, body);
                }
                else {
                    callback(error);
                }
            });
        }
    }

    // traverse json structure and sign all paid video url
    function signLinks(contentStructure, callback) {
        if (!isValidStructure(contentStructure)) {
            callback(null, contentStructure);
        }
        contentStructure = JSON.parse(contentStructure);
        let contents = [];
        for (let session of contentStructure.sessions) {
            for (let content of session.content) {
                try {
                    if (!session.free) {
                        if (session.defaultView) {
                            content.defaultView = session.defaultView;
                        }
                        content.group = session.name;
                        content.link = AWS.signUrl(content.link);
                        contents.push(content);
                    }
                }
                catch (error) {
                    console.log(error);
                    // delete any content link that cant be signed
                }
            }
        }
        callback(null, contents);
    }

    async function getUserPlans(contents, userId, callback) {
        let user = await findUser(userId);
        let plans = await getUserCreatedPlan(userId);
        let assignments = await getAssignment(userId, user.teamId);
        let assignedPlanIds = assignments.map(assignment => {
            return assignment.planId;
        });
        let assignedPlans = await getPlansWithIds(assignedPlanIds);
        let a = {}
        for (let plan of assignedPlans) {
            a[plan._id] = plan;
        }
        assignments.map(assignment => {
            assignment.plan = mapPlanToContent(a[assignment.planId], contents);
        });

        let userPlan = plans.map(plan => {return mapPlanToContent(plan, contents)});
        callback(null, contents, userPlan, assignments);
    }

    const mapPlanToContent = (plan, contents) => {
        let videoContents = [];
        plan.content.forEach(videoId => {
            let content = contents.find(function (element) {
                return element.id === videoId;
            });
            videoContents.push(content);
        });
        plan.detailedContent.forEach(cont => {
            let content = contents.find(function (element) {
                return element.id === cont.contentId;
            });
            if (content) {
                content.reps = cont.reps || 0,
                    content.sets = cont.sets || 0
            }
            videoContents.push(content);
        });
        let p = {
            id: plan._id,
            name: plan.name,
            content: videoContents
        }
        return p;
    }

    const getUserCreatedPlan = (userId) => {
        return new Promise((resolve, reject) => {
            Plan.find({
                userId: userId
            }).sort({ _id: -1 }).lean().exec((error, plans) => {
                if (error) console.error(error)
                resolve(plans)
            });
        });
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

    const getPlansWithIds = (planIds) => {
        return new Promise((resolve, reject) => {
            Plan.find({
                _id: {
                    $in: planIds
                }
            }, (error, plans) => {
                if (error) console.error(error)
                resolve(plans)
            });
        });
    }

    // should test integrity of data structure returned
    // for now always return true
    function isValidStructure(structure) {
        return true;
    }
}
