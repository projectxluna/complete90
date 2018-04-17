var config = {
    production: {
    },
    dev: {
        secret: 'whendidwestopbeingus',
        database: 'mongodb://localhost:27017/complete90',
        braintree: {
            ENVIRONMENT: "Sandbox",
            MERCHANT_ID: "",
            PUBLIC_KEY: "",
            PRIVATE_KEY: "",
        },
        aws: {
            PRIVATE_KEY: "",
            PK_FILE: "",
            CF_DOMAIN: "",
            S3_BUCKET: "",
            VIDEO_STRUCTURE: "",
        },
        mailer: {
            EMAIL_ID: "",
            PASSWORD: ""
        },
        URL_EXPIRATION: 5,
    },
    default: {
    }
}

exports.get = function (env){
    return config[env] || config.dev;
}
