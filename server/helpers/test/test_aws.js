var AWS = require('../aws');

var signed = AWS.signUrl('/videos/dribbling/Highlights.mp4');

console.log('Signed URL',signed);

AWS.listCategories((err, data) => {
    if (err) {
        console.log("Error", err);
    } else {
        //console.log(data)
        AWS.listVideos({categories: data}, (err, data) => {
            if(err) {
                console.log(err)
            } else {
                console.log(data)
            }
        })
    }
});                         