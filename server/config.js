var config = {
    production: {
        secret: 'whendidwestopbeingus',
        database: 'mongodb://localhost:27017/complete90',
        // braintree: {
        //     merchantId: "6f62td8d6yzkn2ry",
        //     publicKey: "jbf66x2y3dp79bt5",
        //     privateKey: "b8037554429d6e8a679b34450e5876b1"
        // },
        braintree: { //Sandbox
            merchantId: "y3xkmxb3xzzw2xkn",
            publicKey: "y4pdj3b3r7yfkrrb",
            privateKey: "ed56424f5bd2785cac0b37c8d02ef482"
        },
        aws: {
            PRIVATE_KEY: "APKAJDTCMHD6IPBCKGDQ",
            PK_FILE: "pk-APKAJDTCMHD6IPBCKGDQ.pem",
            CF_DOMAIN: "https://d22hc8s817tx09.cloudfront.net",
            S3_BUCKET: "complete09",
            VIDEO_STRUCTURE: "https://complete09.s3.us-east-2.amazonaws.com/config/staging_video_structure.json",
        },
        mailer: {
            EMAIL_ID: "projectxluna@gmail.com",
            PASSWORD: "whydidwehavetogrowupsofast",
            SERVICE_PROVIDER: "Gmail"
        },
        mailChimp: {
            API_KEY: 'f309557588b98c932fec841057b6e6b8-us12',
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
        // braintree: {
        //     merchantId: "6f62td8d6yzkn2ry",
        //     publicKey: "jbf66x2y3dp79bt5",
        //     privateKey: "b8037554429d6e8a679b34450e5876b1"
        // },
        braintree: { //Sandbox
            merchantId: "y3xkmxb3xzzw2xkn",
            publicKey: "y4pdj3b3r7yfkrrb",
            privateKey: "ed56424f5bd2785cac0b37c8d02ef482"
        },
        aws: {
            PRIVATE_KEY: "APKAJMPYCKBXNVYFUIHA",
            PK_FILE: "pk-APKAJMPYCKBXNVYFUIHA.pem",
            CF_DOMAIN: "https://dqqdy81dl4r0o.cloudfront.net",
            S3_BUCKET: "complete90",
            VIDEO_STRUCTURE: "https://complete09.s3.us-east-2.amazonaws.com/config/staging_video_structure.json",
        },
        mailer: {
            EMAIL_ID: "emailhere",
            PASSWORD: "**********"
        },
        mailChimp: {
            API_KEY: 'f309557588b98c932fec841057b6e6b8-us12',
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
