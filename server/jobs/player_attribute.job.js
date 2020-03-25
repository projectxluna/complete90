const cron = require('cron');
const ENV = process.env.NODE_ENV;
const request = require('request');
const UserStats = require('../models/stats');
const PlayerAttribute = require('../models/player_attribute');
const mongoose = require('mongoose');
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

const getMean = (data, field) => {
    if (!data || !data.length) {
        return;
    }
    return data.map((v) => {
        return v[field];
    }).reduce((a, b) => {
        return Number(a) + Number(b);
    }) / data.length;
}

const getSD = (data, field) => {
    if (!data || !data.length) {
        return;
    }
    let m = getMean(data, field);
    return Math.sqrt(data.map((v) => {
        return v[field];
    }).reduce((sq, n) => {
        return sq + Math.pow(n - m, 2);
    }, 0) / (data.length - 1));
}

const convertRange = (value, r1, r2) => {
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
}

const callback = async () => {
    let contentTags = await loadContent();
    let userStats = await getAllUserStats();
    let groupedByTags = {};
    allowedTags.forEach(tag => {
        groupedByTags[tag] = [];
    });
    let allContent = [];

    userStats.forEach(stat => {
        if (!stat.content) return;
        stat.content.forEach(c => {
            allContent.push({
                userId: stat._id,
                contentId: c.id,
                watchedTotal: c.watchedTotal
            });
        });
    });
    allContent.forEach(c => {
        let tags = contentTags[c.contentId];
        if (!tags) return;
        tags.forEach(t => {
            groupedByTags[t].push(c);
        });
    });

    Object.keys(groupedByTags).forEach(key => {
        let values = groupedByTags[key];
        if (!values || !values.length) return;
        let standardDiv = getSD(groupedByTags[key], 'watchedTotal');
        // console.log('standard diviation for', key, '=', standardDiv);
        let deviations = [];
        values.forEach(v => {
            let deviationFromMean = Math.floor(v.watchedTotal - standardDiv);
            deviations.push(deviationFromMean);
            v.deviationFromMean = deviationFromMean;
        });
        deviations = deviations.sort((a, b) => {
            return a - b;
        });
        let min = deviations[0];
        let max = deviations[deviations.length -1];
        values.forEach(v => {
            let value = v.deviationFromMean;
            let scaled = Math.floor(convertRange(value, [min, max], [1, 10]));
            v.score = scaled;

            PlayerAttribute.findOneAndUpdate({
                userId: mongoose.Types.ObjectId(v.userId),
                tag: key
            }, {
                userId: mongoose.Types.ObjectId(v.userId),
                tag: key,
                score: v.score
            }, { upsert: true }, (err, numAffected, raw) => {
                // console.log(err, numAffected, raw);
            });
        });
    });

    // console.log(groupedByTags);
}

var PlayerAttributeJob = {
    register: function () {
        // var cronJob = cron.job('0 */12 * * 0-6', callback); // For prod. Every 12 hrs
        var cronJob = cron.job('0-59 * * * *', callback); // For Dev. Runs every 1 minute
        cronJob.start();
    }
}
module.exports = PlayerAttributeJob;
