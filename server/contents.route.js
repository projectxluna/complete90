module.exports = function (apiRoutes) {
    const env = require('./helpers/env.json');
    var Auth = require('./helpers/auth');
    var waterfall = require('async-waterfall');
    var request = require('request');
    var AWS = require('./helpers/aws');

    /**
     * get free sessins
     */
    apiRoutes.get('/free-sessions', function (req, res) {

    });

    /**
     * get all sessions
     */
    apiRoutes.get('/sessions', Auth.isAuthenticated, function (req, res) {

        waterfall([
            loadSessions, signLinks
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

    // load sessions json structure
    function loadSessions(callback) {
        callback(null, JSON.stringify(require('../video_structure.json')));
        // let resourceLocation = env.VIDEO_STRUCTURE || 'https://s3.us-east-2.amazonaws.com/complete90/config/video_structure.json';

        // request(resourceLocation, function (error, response, body) {
        //     if (!error && response.statusCode == 200) {
        //         callback(null, body);
        //     } else {
        //         callback(error);
        //     }
        // });
    }

    // traverse json structure and sign all paid video url
    function signLinks(contentStructure, callback) {
        if (!isValidStructure(contentStructure)) {
            callback(null, contentStructure);
        }
        contentStructure = JSON.parse(contentStructure);
    
        for (let session of contentStructure.sessions) {
            for (let content of session.content) {
                if (content.free) continue;
                try {
                    content.link = AWS.signUrl(content.link);
                } catch (error) {
                    console.log(error);
                    // delete any content link that cant be signed
                }
            }
        }
        callback(null, contentStructure);
    }

    // should test integrity of data structure returned
    // for now always return true
    function isValidStructure(structure) {
        return true;
    }
};
