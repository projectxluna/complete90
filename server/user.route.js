module.exports = function (apiRoutes) {
    const path = require('path');
    const userHelper = require('./helpers/user');
    var Auth = require('./helpers/auth');
    var User = require('./models/user');
    var im = require('imagemagick');
    var PromoController = require('./helpers/promo');
    var mailer = require('./helpers/mailer');

    /**
     * get user profile
     */
    apiRoutes.get('/user/me', Auth.isAuthenticated, function (req, res) {
        User.findOne({ _id: req.decoded.userId }, function (err, user) {
            if (err) return res.status(500).send(err);
            try {
                res.json({
                    success: true,
                    profile: userHelper.exposedData(user)
                });
            } catch (error) {
                res.json({success: false, message: error});
            }
        });
    });

    /**
     * Update user profile
     */
    apiRoutes.post('/user/me', Auth.isAuthenticated, function (req, res) {
        let name = req.body.name;
        let foot = req.body.foot;
        let position = req.body.position;
        let height = req.body.height;
        let companyname = req.body.companyName;
        let teamName = req.body.teamName;

        var update = {};

        if (name) update.name = name;
        if (foot) update.foot = foot;
        if (position) update.position = position;
        if (height) update.height = height;
        if (companyname) update.companyname = companyname;
        if (teamName) update.teamName = teamName;

        User.findOneAndUpdate({ _id: req.decoded.userId }, update,
            {
                upsert: true,
                new: true
            }, function (err, user) {
                if (err) return res.status(500).send(err);
                try {
                    res.json({
                        success: true,
                        profile: userHelper.exposedData(user)
                    });
                } catch (error) {
                    res.json({success: false, message: error});
                }
            });
    });

    /**
     * Activate Promo Code
     */
    apiRoutes.post('/user/promo/activate', Auth.isAuthenticated, function (req, res) {
        let code = req.body.code;
        PromoController.validate(code).then(promo => {
            let update = {
                promo_code: promo.code,
                subscription: promo.values[0]
            }
            User.findOneAndUpdate({ _id: req.decoded.userId }, update, function (err, user) {
                    if (err) return res.status(500).send(err);
                    try {
                        res.json({ success: true });

                        var data = {
                            to: 'info@thecomplete90.com',
                            from: mailer.email,
                            template: 'promo-code-activated',
                            subject: 'The Complete 90 Promo Code Activation',
                            context: {
                                code: code,
                                name: user.name,
                                email: user.email
                            }
                        };

                        mailer.smtpTransport().sendMail(data, function (err) {
                            if (err) {
                                console.error(err);
                            }
                        });
                    } catch (error) {
                        res.json({ success: false, message: error });
                    }
                });
        }).catch(err => {
            res.json({success: false, message: err});
        });
    });

    /**
     * upload user image
     */
    apiRoutes.post('/user/profile-img', Auth.isAuthenticated, function (req, res) {
        if (!req.files) return res.status(400).send('No files were uploaded.');

        let profileImg = req.files.profileImg;
        let ext = '.' + (profileImg.name.split('.')[1]) || '.jpg';
        let imgname = req.decoded.userId + Math.round(new Date().getTime() / 1000) + ext;
        let imgPath = path.join(__dirname, '/../public/imgs/profile/');

        // resize and store image on the server
        // maybe store on s3 later
        im.crop({
            srcData: profileImg.data,
            dstPath: imgPath + imgname,
            width: 300,
            height: 300,
            quality: 1,
            gravity: 'Center'
        }, function (err, stdout, stderr) {
            if (err) return res.status(500).send(err);

            User.findByIdAndUpdate(
                { _id: req.decoded.userId },
                { avatarURL: '/public/imgs/profile/' + imgname },
                { upsert: true, new: true },
                function (err, new_user) {
                    if (err) return res.status(500).send(err);

                    try {
                        res.json({
                            success: true,
                            profile: userHelper.exposedData(new_user)
                        });
                    } catch (error) {
                        res.json({
                            success: false,
                            message: error
                        });
                    }
                });
        });
    });
};
