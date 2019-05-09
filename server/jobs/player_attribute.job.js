const cron = require('cron');
const ENV = process.env.NODE_ENV;
const request = require('request');
const mongoose = require('mongoose');
const User = require('../models/user');
const UserStats = require('../models/stats');

const config = require('../config').get(ENV);

const allowedTags = ['Strength', 'Speed', 'Control', 'Passing', 'Dribbling', 'Finishing'];

const collectTags = (contentStructure) => {
    let contentTags = {};
    for (let session of contentStructure.sessions) {
        for (let content of session.content) {
            try {
                if (!session.free) {
                    let tags = (content.tags || []).filter(e => {
                        return allowedTags.includes(e);
                    });
                    contentTags[content.id] = tags;
                }
            }
            catch (error) {
                console.log(error);
            }
        }
    }
    return contentTags;
}

const loadContent = () => {
    return new Promise((resolve, reject) => {
        if (!ENV || ENV === 'dev' || ENV === 'development') {
            const devContentStructure = require('../../video_structure.json');
            resolve(collectTags(devContentStructure));
        }
        else {
            let resourceLocation = config.aws.VIDEO_STRUCTURE;
            request(resourceLocation, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(collectTags(JSON.parse(body)));
                }
                else {
                    reject(error);
                }
            });
        }
    });
}

const getAllUserStats = () => {
    return new Promise((resolve, reject) => {
        UserStats.aggregate([
            {
                $match: {}
            },
            {
                $group: {
                    _id: '$userId',
                    content: {
                        $addToSet: {
                            id: '$content.id',
                            watchedTotal: { $sum: '$content.watchedTotal' },
                        }
                    }
                }
            }
        ], function (err, userStats) {
            if (err || !userStats || !userStats.length) {
                reject(err);
            }
            resolve(userStats);
        });
    });
}

const findUsers = () => {
    return new Promise((resolve, reject) => {
        User.findById(userId, (err, user) => {
            if (err) {
                reject(err)
            }
            resolve(user)
        })
    });
}

const callback = async () => {
    console.log('Runing Player Atrribute Job')
    // let contentTags = await loadContent();
    // let userStats = await getAllUserStats();
    // let groupedByTags = {};

    // userStats.forEach(stat => {
    //     if (!stat.content) return;
    //     stat.content.forEach(c => {
    //         if (groupedByTags[c.id]) {
    //             groupedByTags[c].push(c)
    //         }
    //     });
    // });
    // console.log(contentTags)

}

var PlayerAttributeJob = {
    register: function () {
        // var cronJob = cron.job('0 */12 * * 0-6', callback); // For prod. Every 12 hrs
        var cronJob = cron.job('0-59 * * * *', callback); // For Dev. Runs every 1 minute
        cronJob.start();
    }
}
module.exports = PlayerAttributeJob;
