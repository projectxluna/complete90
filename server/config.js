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
            VIDEO_STRUCTURE: "https://complete09.s3.us-east-2.amazonaws.com/config/staging_video_structure.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGwaCXVzLWVhc3QtMSJHMEUCIBAp13XaK1CoNURMxn1JhJfoKpMK1csiR6kS7wEbcmmCAiEAjYlDEDtrFkkCCxWcW0jnx%2FVu%2FfD0hxiWbMwqz%2F9IbPAqxAIINRABGgw0MjQ4Mzg4MjQ2MjEiDB3E3WxrfRksNOpxzCqhAsxq5dh%2FtpIWNSx%2BB5bup4aGiKLIV%2Br5yzHezTYL%2BXYRHk%2FY5zM7H2Z6XVYMqwWEWR%2FrvRi7htya7fmntzUokL6K%2B3Rc5WsSu8EfK3zfh61TooxoEpxHpoz6sL00Ng%2BXDPkWLCFpLVdsqX8S7%2BHUdaU2FCjE3z0X4P%2Fk0LsM97vGh94pLiakCtwpN0C4EuqfkTbDsiuY9%2FtG5pkdmHd9mkqBn7jiMnzd50%2FlHAkiQJSQlvphF5%2FlqHNAP0Yl9YYT2MV%2BQIfedIvIUXWOKPF%2FTdTOfoelOOS0NmrqI0%2Bvr08H6o1mZfdxK1gX88Ir72kYTGHhPhFDMEkQMI%2FgJBe9G%2Fe5fcsQnouizo0sobkozFkDZ1Gnd0Vw0nYZhAsh2Qr15EswxsyM%2BQU6sAJgMlPiFsmmYcVw0LsuyIN3O80zmmsMBeYWJDmVTNQhT4tcOBxZJxY4hb3B1tSbFU5NYox8U1bzwTSq6LXSm8TP1WTcgA%2BhEWQKDwxqrx8m%2FtlFA%2FKdg4OQFzS%2F26J3E%2BO9wQzuhWVjH6eUMevG85xZAQ4k8hEbmW1po0vplr7sVqqHWlyaAxsO%2BKFfgNkRr85DAD%2BNFKeS%2BANnx6c%2BscJNmsA8Png4X2CjW5MEueVwvQSbfCxg7arsGni1c2hTlZdh2LeSych%2BmEtdPjSPYgAXCzz4PntsN4wNNFa2TMGAtUR5PhxZ7PlH09wA257qUxfE%2BYsRqP48GetFfwye2pvV6v54PtO3QCHg07cDxudSnXjTTrpWa6YFqZ5ruDZ%2BIK%2FmR0hoRyRtUw0b7MyfPBck&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20200730T214108Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAWF2S6AKWXDZO6WVE%2F20200730%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=06970cfd4f66d71cf5d22d80c3effa5aff378ccca35f4a3708cd607d91b9fe68",
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
            VIDEO_STRUCTURE: "https://s3.us-east-2.amazonaws.com/complete90/config/staging_video_structure.json",
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
