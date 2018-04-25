var config = {
    production: {
    },
    dev: {
        secret: 'whendidwestopbeingus',
        database: 'mongodb://localhost:27017/complete90',
        braintree: {
            ENVIRONMENT: "Sandbox",
            MERCHANT_ID: "64wmhwjzmhx4zpsn",
            PUBLIC_KEY: "db9j7d8kpm8j8ybj",
            PRIVATE_KEY: "02015303a86d48d9a3badb0b8b5d81f8",
        },
        aws: {
            PRIVATE_KEY: "APKAJMPYCKBXNVYFUIHA",
            PK_FILE: "pk-APKAJMPYCKBXNVYFUIHA.pem",
            CF_DOMAIN: "https://dqqdy81dl4r0o.cloudfront.net",
            S3_BUCKET: "complete90",
            VIDEO_STRUCTURE: "https://s3.us-east-2.amazonaws.com/complete90/config/video_structure.json",
        },
        mailer: {
            EMAIL_ID: "projectxluna@gmail.com",
            PASSWORD: "**********"
        },
        URL_EXPIRATION: 5,
    },
    default: {
    }
}

exports.get = function (env){
    return config[env] || config.dev;
}
