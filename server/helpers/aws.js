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
    },
    listCategories: function (callback) {
        s3 = new AWS.S3({ apiVersion: '2006-03-01' });

        var bucketParams = {
            Bucket: 'complete90',
            Prefix: 'videos/',
            Delimiter: '/',
        };

        s3.listObjectsV2(bucketParams, function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback(undefined, data.CommonPrefixes)
            }
        });
    },
    listVideos: function (config, callback) {
        if (!config || !config.categories || config.categories.length < 1) {
            return;
        }
        let categories = config.categories;
        let result = {};

        s3 = new AWS.S3({ apiVersion: '2006-03-01' });
        categories.forEach(dir => {
            var bucketParams = {
                Bucket: 'complete90',
                Prefix: dir.Prefix,
                Delimiter: '/',
            };

            s3.listObjectsV2(bucketParams, function (err, data) {
                if (err) {
                    callback(err);
                } else {
                    if (data.Contents.length > 0) {
                        let k = data.Contents[0].Key.split('/')[1];
                        result[k] = data.Contents.filter(x => x.Key !== dir.Prefix);
                    }
                }
                if(Object.keys(result).length == categories.length) {
                    callback(undefined, result);
                }
            });
        });
    }
}
module.exports = awsController;
