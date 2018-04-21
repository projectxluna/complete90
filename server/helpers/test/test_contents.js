var request = require('request');
var AWS = require('../aws');

let resourceLocation = 'https://s3.us-east-2.amazonaws.com/complete90/config/video_structure.json';

// request(resourceLocation, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//         signLinks(body, (err, result) => {
//             if (!err) {
//                 console.log(result);
//             }
//         });
//     }
// });
var content = require('../../../video_structure.json')
signLinks(JSON.stringify(content), (err, result) => {
    if (!err) {
        console.log(JSON.stringify(result));
    }
});

// 2. traverse json structure and sign all video url
function signLinks(contentStructure, callback) {
    //console.log(contentStructure)
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