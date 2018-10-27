module.exports = function (apiRoutes) {
    var config = require('./config').get(process.env.NODE_ENV);
    var Auth = require('./helpers/auth');
    var waterfall = require('async-waterfall');
    var request = require('request');
    var AWS = require('./helpers/aws');

    var Plan = require('./models/plan');
    var User = require('./models/user');

    var UserStats = require('./models/stats');
    var mongoose = require('mongoose');

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
                    if (!user.braintree.subscription) {
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
        ], function (err, contents, userPlans) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            }
            res.json({
                success: true,
                content: contents,
                plans: userPlans
            });
        });
    });

    /**
     * Create and modify training plan
     */
    apiRoutes.post('/session/plan', Auth.isAuthenticated, function (req, res) {
        let name = req.body.name;
        let content = req.body.content;
        let id = req.body.id;
        let userId = req.decoded.userId;

        if (!name || !content) return res.status(422).send({ success: false });

        if (id) {
            Plan.findByIdAndUpdate(mongoose.Types.ObjectId(id), {
                name: name,
                content: content
            }, function (err, plan) {
                if (err) {
                    console.error(err)
                    return res.json({
                        success: false,
                        message: err.errmsg,
                        code: err.code
                    });
                }
                res.json({
                    success: true,
                    id: plan._id
                });
            });
        } else {
            let newPlan = new Plan();
            newPlan.name = name;
            newPlan.content = content;
            newPlan.userId = userId;
            newPlan.save(function (err, plan) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err.errmsg,
                        code: err.code
                    });
                }
                res.json({
                    success: true,
                    id: plan._id
                });
            });
        }
    });

    /**
     * Delete training plan
     */
    apiRoutes.delete('/session/plan', Auth.isAuthenticated, function (req, res) {
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

    function getUserPlans(contents, userId, callback) {
        Plan.find({
            userId: userId
        }).sort({ _id: -1 }).exec((err, plans) => {
            if (err) callback(err);

            let userPlan = [];
            for (let plan of plans) {
                let videoContents = [];
                plan.content.forEach(videoId => {
                    let content = contents.find(function (element) {
                        return element.id === videoId;
                    });
                    videoContents.push(content);
                });
                let p = {
                    id: plan._id,
                    name: plan.name,
                    content: videoContents
                }
                userPlan.push(p);
            }
            callback(null, contents, userPlan);
        });
    }

    // should test integrity of data structure returned
    // for now always return true
    function isValidStructure(structure) {
        return true;
    }
}
