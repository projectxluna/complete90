module.exports = function (apiRoutes) {
    var config = require('./config').get(process.env.NODE_ENV);
    var Auth = require('./helpers/auth');
    var waterfall = require('async-waterfall');
    var request = require('request');
    var AWS = require('./helpers/aws');
    var Plan = require('./models/plan');
    
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
            loadSessions,
            signLinks,
            function (contents, callback) {
                callback(null, contents, userId);
            },
            getUserPlans
        ], function (err, contents, userPlans) {
            if (err) {
                return res.status(422).send({
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
     * create new plan(s)
     */
    apiRoutes.post('/session/plan', Auth.isAuthenticated, function (req, res) {
    });
    
    /**
     * modify a training plan(s)
     */
    apiRoutes.put('/session/plan', Auth.isAuthenticated, function (req, res) {
    });
    
    /**
     * get user watched stats
     */
    apiRoutes.get('/stats', Auth.isAuthenticated, function (req, res) {
    });
    
    /**
     * update user watched stats
     */
    apiRoutes.put('/stats', Auth.isAuthenticated, function (req, res) {
    });
    
    /**
     * log watched content stats
     */
    apiRoutes.post('/stats', Auth.isAuthenticated, function (req, res) {
    });

    // load free sessions
    function loadFreeSession(callback) {
        let nodeEnv = process.env.NODE_ENV;
        let contentStructure;
        if (!nodeEnv || nodeEnv === 'development') {
            contentStructure = require('../video_structure.json');
            let freeSessions = [];
            for (let session of contentStructure.sessions) {
                if (session.free) {
                    for (let content of session.content) {
                        content.group = session.name;
                        freeSessions.push(content);
                    }
                }
            }
            callback(null, freeSessions);
        }
        else {
            // make request to s3
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
        }).limit(10).sort({ _id: -1 }).exec((err, plans) => {
            if (err) callback(err);

            let userPlan = [];
            for (let plan of plans) {
                let p = {
                    id: plan._id,
                    name: plan.name,
                    content: plan.content
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
