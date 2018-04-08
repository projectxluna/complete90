var env = require('./env.json');
var cfsign = require('aws-cloudfront-sign');
var path = require('path');
var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });


var awsController = {
    // Generating a signed URL
    signUrl: function (url) {
        var expireAt = new Date();
        expireAt.setDate(expireAt.getDate() + (env.URL_EXPIRATION || 5)); //expire in 5 days

        return cfsign.getSignedUrl(
            env.CF_DOMAIN+url,
            {
                keypairId: env.AWS_PRIVATE_KEY,
                privateKeyPath: path.join(__dirname, env.AWS_PK_FILE),
                expireTime: expireAt
            }
        );
    }
}
module.exports = awsController;
