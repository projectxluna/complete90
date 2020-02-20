var cron = require('cron');
var UserStats = require('../models/stats');
var User = require('../models/user');
var Club = require('../models/club');
var Team = require('../models/team')
var mailer = require('../helpers/mailer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const ENV = process.env.NODE_ENV;

function getWeeklyRange() {
    let currentDate = new Date(); // current date of week

    let currentWeekDay = currentDate.getDay();
    let lessDays = (currentWeekDay == 0) ? 6 : currentWeekDay - 1;

    let startDate = new Date(new Date(currentDate).setDate(currentDate.getDate() - lessDays));
    startDate.setUTCHours(0, 0, 0, 0);

    let endDate = new Date(new Date(startDate).setDate(startDate.getDate() + 6));
    endDate.setUTCHours(0, 0, 0, 0);

    return {startDate, endDate, label: 'weekly'};
}

function getLastMonthRange() {

    let currentDate = new Date();
    currentDate.setDate(1);
    currentDate.setMonth(currentDate.getMonth() - 1);
    currentDate.setHours(0,0,0,0);

    let startDate = new Date(currentDate);

    let endDate = new Date();

    return {startDate, endDate, label: 'monthly'};
}

function sendMail(data) {
    return new Promise((resolve, reject) => {
        mailer.smtpTransportPure().sendMail(data, (err) => {
            if (!err) {
                resolve();
            } else {
                console.error(err);
                resolve();
            }
        });
    });
}

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

function elapsedTime(time) {
    var h = 0, m = 0, s = 0;
    var newTime = '';

    h = Math.floor(time / (60 * 60 * 1000));
    time = time % (60 * 60 * 1000);
    m = Math.floor(time / (60 * 1000));
    time = time % (60 * 1000);
    s = Math.floor(time / 1000);

    newTime += `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}`;
    return newTime;
}

function pad(num, size) {
    var s = "0000" + num;
    return s.substr(s.length - size);
}

function callback({label, startDate, endDate}) {
    try {

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
            },
            { $sort : { watchedTotal : -1 } }
        ], async (err, stats) => {
            if (err) {
                // Unable to calculate top players for date
                var data = {
                    to: 'support@thecomplete90.com',
                    from: mailer.email,
                    text: 'Unable to calculate players leader board for ' + label + ' timerange',
                    subject: 'Leaderboard Report Error',
                };
                await sendMail(data);
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
                    watchedTotal: elapsedTime(mapedStats[statUserId].watchedTotal),
                    count: mapedStats[statUserId].count,
                    position: playerProfile? playerProfile.position : 'N/A',
                    clubName: club? club.name : 'N/A',
                    teamName: team? team.name : 'N/A'
                };
            });
            const sorted = await Promise.all(pArray);

            let fileName = `${label}_leaderboard.csv`;
            let filePath = `/tmp/${fileName}`;

            // Create a new writer for each file name
            let csvWriter = createCsvWriter({
                path: filePath,
                header: [
                  {id: 'name', title: 'Name'},
                  {id: 'clubName', title: 'Club Name'},
                  {id: 'teamName', title: 'Team Name'},
                  {id: 'position', title: 'Position'},
                  {id: 'watchedTotal', title: 'Time'},
                  {id: 'count', title: 'Number of Videos'},
                ]
            });
            csvWriter
                .writeRecords(sorted)
                .then(()=> {
                    console.log('saved file to', filePath)
                    var data = {
                        to: 'support@thecomplete90.com',
                        from: mailer.email,
                        subject: label.toUpperCase() + ' Leaderboard Report',
                        attachments: [
                            {
                                filename: fileName,
                                path: filePath
                            }
                        ]
                    };
                    sendMail(data);
                });
        });
    } catch (error) {
        console.error(error);
    }
}

function runMonthlyReport() {
    callback(getLastMonthRange());
}

function runWeeklyReport() {
    callback(getWeeklyRange());
}


var StatsJob = {
    register: function () {
        let monthlyJob, weeklyJob;

        if (!ENV || ENV === 'dev' || ENV === 'development') {
            weeklyJob = cron.job('0-59 * * * *', runWeeklyReport); // For Dev. Runs every 1 minute
            monthlyJob = cron.job('0-59 * * * *', runMonthlyReport); // For Dev. Runs every 1 minute
        } else {
            weeklyJob = cron.job('0 5 * * 1', runWeeklyReport); // Every Sunday at Midnight
            monthlyJob = cron.job('0 5 1 * *', runMonthlyReport); // Every 1st of the Month
        }

        monthlyJob.start();
        weeklyJob.start();
    }
}
module.exports = StatsJob;
