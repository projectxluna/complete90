const cron = require('cron');
const ENV = process.env.NODE_ENV;
const request = require('request');
const User = require('../models/user');
const UserStats = require('../models/stats');
const PlayerAttribute = require('../models/player_attribute');
const mongoose = require('mongoose');
const config = require('../config').get(ENV);
const redis = require('redis');
const redisClient = redis.createClient();

const allowedTags = ['Strength', 'Speed', 'Control', 'Passing', 'Dribbling', 'Finishing'];

const getLastComputationTime = () => {
    return new Promise(async (resolve, reject) => {
        redisClient.get('player_attribute_last_computed', (err, reply) => {
            if (err) {
                console.error(err);
                return resolve();
            }
            let last30 = 1000 * 60 * 60 * 24 * 30;
            reply = reply ? new Date(parseInt(reply)) : new Date(Date.now() - last30);
            resolve(reply);
        });
    });
};

const setLastComputationTime = () => {
    redisClient.set('player_attribute_last_computed', Date.now());
};

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
};

const loadContent = () => {
    return new Promise((resolve, reject) => {
        if (!ENV || ENV === 'dev' || ENV === 'development') {
            const devContentStructure = require('../../staging_video_structure.json');
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
};

const findAllUsers = () => {
    return new Promise(async (resolve, reject) => {
        let lastWeek = 1000 * 60 * 60 * 24 * 7;
        User.find({}, {_id: 1, name: 1}, (err, users) => {
            if (err) {
                console.error('Error while fetching all users:', err);
            }
            resolve(users || []);
        });
    });
};

const findUserStats = (userId, sinceDate) => {
    return new Promise((resolve, reject) => {
        UserStats.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId),
                    updatedAt: {
                        $gte: sinceDate
                    }
                }
            },
            {
                $group: {
                    _id: '$content.id',
                    watchedTotal: { $sum: '$content.watchedTotal' }
                }
            }
        ], function (err, userStats) {
            if (err) {
                reject(err);
            }
            resolve(userStats);
        });
    });
};

const updateTagScore = (userId, tag, score) => {
    return new Promise(async (resolve, reject) => {
        PlayerAttribute.findOneAndUpdate({
            userId: mongoose.Types.ObjectId(userId),
            tag: tag
        }, {
            userId: mongoose.Types.ObjectId(userId),
            tag: tag,
            score: score
        }, { upsert: true }, (err, numAffected, raw) => {
            if (err) {
                console.error(err);
            }
            resolve(raw);
        });
    });
};

const updateLastAttributeTimestamp = (userId) => {
    return new Promise(async (resolve, reject) => {
        User.findOneAndUpdate({
            _id: mongoose.Types.ObjectId(userId),
        }, {
            lastAttributeUpdate: new Date(Date.now())
        }, { upsert: false }, (err, numAffected, raw) => {
            if (err) {
                console.error(err);
            }
            resolve(raw);
        });
    });
};

const findPlayerAttributes = (userId) => {
    return new Promise(async (resolve, reject) => {
        PlayerAttribute.find({userId: mongoose.Types.ObjectId(userId)}, (err, res) => {
            if (err) {
                console.err(err);
            }
            let att = {};
            if (res) {
                for (let r of res) {
                    att[r.tag] = r.score || 50 ;
                }
            }
            resolve(att);
        });
    });
};

const rules = [
    {min_score: 50, max_score: 60, inc: 1, watch_time_required: 1000 * 60 * 30},
    {min_score: 61, max_score: 70, inc: 1, watch_time_required: 1000 * 60 * 90},
    {min_score: 71, max_score: 80, inc: 1, watch_time_required: 1000 * 60 * 60 * 4},
    {min_score: 81, max_score: 90, inc: 1, watch_time_required: 1000 * 60 * 60 * 8},
    {min_score: 91, max_score: 100, inc: 1, watch_time_required: 1000 * 60 * 60 * 15}
];

const getIncreaseRule = (score) => {
    let rule = rules.find(r => score >= r.min_score && score <= r.max_score);
    if (!rule) {
        rule = rules[0];
    }
    return rule.watch_time_required;
};

const callback = async () => {
    let lastComputationTime = await getLastComputationTime();
    let users = await findAllUsers();
    let contentTagMap = await loadContent();

    function processNext() {
        let user = users.pop();
        if (!user) {
            setLastComputationTime();
            return;
        }
        setTimeout(async ()=> {
            try {
                let cutoff = user.lastAttributeUpdate || lastComputationTime;
                let stats = await findUserStats(user._id, cutoff);
                let currentPlayerAttribute = await findPlayerAttributes(user._id);
                if (stats && stats.length) {
                    /**
                     * [tagsStats] is a hashmap of the different categories
                     * and the corresponding total time spent training
                     * i.e: { Speed: 4810053, Strength: 3585540 }
                     */
                    let tagsStats = {};
                    for (let stat of stats) {
                        let applicableTags = contentTagMap[stat._id];
                        for (let t of applicableTags) {
                            if (tagsStats[t]) {
                                tagsStats[t] += stat.watchedTotal;
                            } else {
                                tagsStats[t] = stat.watchedTotal;
                            }
                        }
                    }
                    for (let tag of Object.keys(tagsStats)) {
                        let curScore = currentPlayerAttribute[tag];
                        curScore = curScore || curScore < 50 ? 50 : curScore;
                        let watchedTotals = tagsStats[tag];
                        let requiredWatchTimeForPoint = Math.round(getIncreaseRule(curScore));
                        if (watchedTotals > requiredWatchTimeForPoint) {
                            let pointsInc = Math.round(watchedTotals/requiredWatchTimeForPoint);
                            let score = curScore + pointsInc;
                            await updateTagScore(user._id, tag, score);
                            await updateLastAttributeTimestamp(user._id);
                        }
                    }
                    console.log(tagsStats);
                } else {
                    for (let tag of allowedTags) {
                        let score = currentPlayerAttribute[tag];
                        if (score == 50) {
                            continue;
                        }
                        if (!score || score < 50) {
                            score = 50;
                        } else {
                            score--;
                        }
                        await updateTagScore(user._id, tag, score);
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                processNext();
            }
        }, 10);
    }
    processNext();
}

var PlayerAttributeJob = {
    register: function () {
        callback();
        var cronJob = cron.job('* 0 * * * *', callback);
        cronJob.start();
    }
}
module.exports = PlayerAttributeJob;
