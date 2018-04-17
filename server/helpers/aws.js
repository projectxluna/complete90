var config = require('../config').get(process.env.NODE_ENV);
var cfsign = require('aws-cloudfront-sign');
var path = require('path');
var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });


var awsController = {
    // Generating a signed URL
    signUrl: function (url) {
        var expireAt = new Date();
        expireAt.setDate(expireAt.getDate() + (config.URL_EXPIRATION || 5)); //expire in 5 days

        return cfsign.getSignedUrl(
            config.aws.CF_DOMAIN+url,
            {
                keypairId: config.aws.PRIVATE_KEY,
                privateKeyPath: path.join(__dirname, config.aws.PK_FILE),
                expireTime: expireAt
            }
        );
    }
}
module.exports = awsController;
