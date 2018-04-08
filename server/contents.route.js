module.exports = function (apiRoutes) {
    const env = require('./helpers/env.json');
    var Auth = require('./helpers/auth');
    var waterfall = require('async-waterfall');
    var request = require('request');
    var AWS = require('./helpers/aws');

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
                sessions: result
            });
        });
    });

    // load sessions json structure
    function loadSessions(callback) {
        let resourceLocation = env.VIDEO_STRUCTURE || 'https://s3.us-east-2.amazonaws.com/complete90/config/video_structure.json';

        request(resourceLocation, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(null, body);
            } else {
                callback(error);
            }
        });
    }

    // traverse json structure and sign all paid video url
    function signLinks(contentStructure, callback) {
        if (!isValidStructure(contentStructure)) {
            callback(null, contentStructure);
        }
        contentStructure = JSON.parse(contentStructure);

        for (var key in contentStructure) {
            if (!contentStructure.hasOwnProperty(key)) continue;

            var obj = contentStructure[key];

            if (obj.content && obj.content.length > 1) {
                for (let content of obj.content) {
                    if (content.free) continue;
                    try {
                        content.link = AWS.signUrl(content.link);
                    } catch (error) {
                        console.log(error);
                        delete content; // delete any content link that cant be signed
                    }
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
