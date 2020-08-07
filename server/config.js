var config = {
    production: {
        secret: 'xxxxxx',
        database: 'mongodb://localhost:27017/complete90',
        braintree: { //Production
            merchantId: "xxxxx",
            publicKey: "xxxxxx",
            privateKey: "xxxxx"
        },
        aws: {
            PRIVATE_KEY: "xxxx",
            PK_FILE: "pk-APKAJDTCMHD6IPBCKGDQ.pem",
            CF_DOMAIN: "https://d22hc8s817tx09.cloudfront.net",
            S3_BUCKET: "complete09",
            VIDEO_STRUCTURE: "https://s3.us-east-2.amazonaws.com/complete09/config/staging_video_structure.json",
        },
        mailer: {
            EMAIL_ID: "projectxluna@gmail.com",
            PASSWORD: "xxxxxxxxxxx",
            SERVICE_PROVIDER: "Gmail"
        },
        mailChimp: {
            API_KEY: 'xxxxxxxxxx-us12',
            SIGN_UP_LIST: '5b09ab4768', // The complete90 Website Subscribers
            COACH_SIGN_UP_LIST: '3d319353fe', // Coach Welcome Emails
            CLUB_SIGN_UP_LIST: '2b409880ea', // Website coaches accounts
            PLAYER_LIST: 'e4cce77bfd', // The complete 90 
        },
        URL_EXPIRATION: 5,
    },

    dev: {
        secret: 'whendidwestopbeingus',
        database: 'mongodb://localhost:27017/complete90',
        braintree: { //Sandbox
            merchantId: "dsfdsfdsf",
            publicKey: "dsfsdfsfds",
            privateKey: "sdfdsfdsfsdfsdf"
        },
        aws: {
            PRIVATE_KEY: "dsdsdfdsf",
            PK_FILE: "pk-APKAJMPYCKBXNVYFUIHA.pem",
            CF_DOMAIN: "https://dqqdy81dl4r0o.cloudfront.net",
            S3_BUCKET: "complete90",
            VIDEO_STRUCTURE: "https://s3.us-east-2.amazonaws.com/complete90/config/staging_video_structure.json",
        },
        mailer: {
            EMAIL_ID: "emailhere",
            PASSWORD: "**********"
        },
        mailChimp: {
            API_KEY: 'ssadsadsadsad-us12',
            SIGN_UP_LIST: '5b09ab4768', // The complete90 Website Subscribers
            COACH_SIGN_UP_LIST: '3d319353fe', // Coach Welcome Emails
            CLUB_SIGN_UP_LIST: '2b409880ea', // Website coaches accounts
            PLAYER_LIST: 'e4cce77bfd', // The complete 90 
        },

        URL_EXPIRATION: 5,
    },
    default: {
    }
}

exports.get = function (env){
    return config[env] || config.dev;
}
