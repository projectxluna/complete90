var cron = require('cron');
var UserStats = require('../models/stats');
var User = require('../models/user');
var Club = require('../models/club');
var Team = require('../models/team')

function getWeeklyRange() {
    let currentDate = new Date(); // current date of week

    let currentWeekDay = currentDate.getDay();
    let lessDays = (currentWeekDay == 0) ? 6 : currentWeekDay - 1;

    let startDate = new Date(new Date(currentDate).setDate(currentDate.getDate() - lessDays));
    startDate.setUTCHours(0, 0, 0, 0);

    let endDate = new Date(new Date(startDate).setDate(startDate.getDate() + 6));
    endDate.setUTCHours(0, 0, 0, 0);

    return {startDate, endDate};
}

function getMonthRange() {
    let currentDate = new Date();

    let startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    startDate.setUTCHours(0, 0, 0, 0);

    let endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    endDate.setUTCHours(0, 0, 0, 0);

    return {startDate, endDate};
}

function getAllTimeRange() {
    let startDate = new Date(0);
    startDate.setUTCHours(0, 0, 0, 0);

    let endDate = new Date();
    endDate.setUTCHours(0, 0, 0, 0);

    return {startDate, endDate};
}

var range = {
    weekly: getWeeklyRange(),
    monthly: getMonthRange(),
    allTime: getAllTimeRange()
};

function findUser(userId) {
    return new Promise((resolve, reject) => {
        User.findById(userId, (err, user) => {
            if (err) {
                reject(err)
            }
            resolve(user)
        })
    });
}

const findClubById = (id) => {
    return new Promise((resolve, reject) => {
        Club.findById(id, (err, club) => {
            if (err) console.log(err);
            resolve(club);
        });
    });
}

const findTeamById = (id) => {
    return Team.findById(id).lean().exec();
}

function callback() {
    try {
        
        Object.keys(range).forEach(key => {

            let {startDate, endDate} = range[key];

            let match = {
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }
            };

            UserStats.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: {
                            userId: '$userId',
                            contentId: '$content.id'
                        },
                        userId: { $first: '$userId' },
                        watchedTotal: { $sum: '$content.watchedTotal' }
                    }
                }
            ], async (err, stats) => {
                if (err) {
                    console.error(err);
                    return;
                }
                let mapedStats = {};
                stats.map(stat => {
                    let userId = stat._id.userId;
                    if (!mapedStats[userId]) {
                        mapedStats[userId] = {
                            count: 1,
                            watchedTotal: stat.watchedTotal
                        };
                    } else {
                        let m = mapedStats[userId];
                        m.count += 1;
                        m.watchedTotal += stat.watchedTotal;
                    }
                });
                const pArray = Object.keys(mapedStats).map(async (statUserId) => {
                    let user =  await findUser(statUserId);
                    if (!user) return;

                    let club, team;

                    if (user.clubId) {
                        club = await findClubById(user.clubId);
                    }
                    if (user.teamId) {
                        team = await findTeamById(user.teamId);
                    }

                    let playerProfile = user.profiles.find(f => f.type === 'PLAYER');
                    return {
                        name: user.name,
                        watchedTotal: mapedStats[statUserId].watchedTotal,
                        count: mapedStats[statUserId].count,
                        position: playerProfile? playerProfile.position : 'N/A',
                        clubName: club? club.name : 'N/A',
                        teamName: team? team.name : 'N/A'
                    };
                });
                const mapped = await Promise.all(pArray);
                let sorted = mapped.filter((a) => {return a != null && a != undefined }).sort((a, b) => {return b.watchedTotal - a.watchedTotal});

                console.log(key)
                console.log(sorted)
            });
        });
    } catch (error) {
        console.error(error);
    }
}


var LeaderboardJob = {
    register: function () {
        var cronJob = cron.job('0-59 * * * *', callback); // For Dev. Runs every 1 minute
        // cronJob.start();
    }
}
module.exports = LeaderboardJob;
