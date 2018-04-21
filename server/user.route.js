module.exports = function (apiRoutes) {
    const path = require('path');
    const userHelper = require('./helpers/user');
    var Auth = require('./helpers/auth');
    var User = require('./models/user');

    /**
     * get user profile
     */
    apiRoutes.get('/user/me', Auth.isAuthenticated, function (req, res) {
        User.findOne({ _id: req.decoded.userId }, function (err, user) {
            if (err) return res.status(500).send(err);

            res.json({
                success: true,
                profile: userHelper.exposedData(user)
            });
        });
    });

    /**
     * upload user image
     */
    apiRoutes.post('/user/profile-img', Auth.isAuthenticated, function (req, res) {
        if (!req.files) return res.status(400).send('No files were uploaded.');

        let profileImg = req.files.profileImg;
        let imgname = req.decoded.userId + Math.round(new Date().getTime() / 1000) + profileImg.mimetype;
        let imgPath = path.join(__dirname, '/../public/imgs/profile');

        //store image on the server
        profileImg.mv(imgPath + imgname, function (err) {
            if (err) return res.status(500).send(err);

            User.findByIdAndUpdate(
                { _id: req.decoded.userId },
                {
                    avatarURL: '/public/imgs/profile/' + imgname
                },
                {
                    upsert: true,
                    new: true
                },
                function (err, new_user) {
                    if (err) return res.status(500).send(err);

                    res.json({
                        success: true
                    });
                });
        });
    });
};
