var request = require('request');
var AWS = require('../aws');

let resourceLocation = 'https://s3.us-east-2.amazonaws.com/complete90/config/video_structure.json';

request(resourceLocation, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        signLinks(body, (err, result) => {
            if (!err) {
                console.log(result);
            }
        });
    }
});

// 2. traverse json structure and sign all video url
function signLinks(contentStructure, callback) {
    if (!isValidStructure(contentStructure)) {
        callback(null, JSON.stringify(contentStructure));
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
    callback(null, JSON.stringify(contentStructure));
}

// should test integrity of data structure returned
// for now always return true
function isValidStructure(structure) {
    return true;
}