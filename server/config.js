var config = {
    production: {
        secret: 'whendidwestopbeingus',
        database: 'mongodb://localhost:27017/complete90',
        braintree: {
            merchantId: "64wmhwjzmhx4zpsn",
            publicKey: "db9j7d8kpm8j8ybj",
            privateKey: "02015303a86d48d9a3badb0b8b5d81f8"
        },
        aws: {
            PRIVATE_KEY: "APKAJDTCMHD6IPBCKGDQ",
            PK_FILE: "pk-APKAJDTCMHD6IPBCKGDQ.pem",
            CF_DOMAIN: "https://d22hc8s817tx09.cloudfront.net",
            S3_BUCKET: "complete09",
            VIDEO_STRUCTURE: "https://s3.us-east-2.amazonaws.com/complete09/config/video_structure.json",
        },
        mailer: {
            EMAIL_ID: "projectxluna@gmail.com",
            PASSWORD: "**********"
        },
        mailChimp: {
            API_KEY: 'apikeyhere-us12',
            SIGN_UP_LIST: 'XXXXXXXXX'
        },
        URL_EXPIRATION: 5,
    },

    dev: {
        secret: 'whendidwestopbeingus',
        database: 'mongodb://localhost:27017/complete90',
        braintree: {
            merchantId: "64wmhwjzmhx4zpsn",
            publicKey: "db9j7d8kpm8j8ybj",
            privateKey: "02015303a86d48d9a3badb0b8b5d81f8"
        },
        aws: {
            PRIVATE_KEY: "APKAJMPYCKBXNVYFUIHA",
            PK_FILE: "pk-APKAJMPYCKBXNVYFUIHA.pem",
            CF_DOMAIN: "https://dqqdy81dl4r0o.cloudfront.net",
            S3_BUCKET: "complete90",
            VIDEO_STRUCTURE: "https://s3.us-east-2.amazonaws.com/complete90/config/video_structure.json",
        },
        mailer: {
            EMAIL_ID: "emailhere",
            PASSWORD: "**********"
        },
        mailChimp: {
            API_KEY: 'apikeyhere-us12',
            SIGN_UP_LIST: 'XXXXXXXXX'
        },

        URL_EXPIRATION: 5,
    },
    default: {
    }
}

exports.get = function (env){
    return config[env] || config.dev;
}
