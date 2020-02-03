var cron = require('cron');
var UserStats = require('../models/stats');
var User = require('../models/user');
var Club = require('../models/club');
var Team = require('../models/team')
var mailer = require('../helpers/mailer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  
var range = {
    weekly: 1000 * 60 * 60 * 24 * 7,
    monthly: 1000 * 60 * 60 * 24 * 30,
};

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

    if (h > 0) {
      newTime += pad(h, 2) + ':';
    }
    newTime += pad(m, 2) + ':' + pad(s, 2);
    return newTime;
}

function pad(num, size) {
    var s = "0000" + num;
    return s.substr(s.length - size);
}

function callback() {
    try {
        
        Object.keys(range).forEach(key => {
            let date = new Date(Date.now() - range[key]);

            let match = {
                createdAt: {
                    $gte: date,
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
                    // Unable to calculate top players for date
                    var data = {
                        to: 'support@thecomplete90.com',
                        from: mailer.email,
                        text: 'Unable to calculate players leader board for ' + key + ' timerange',
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
                        position: playerProfile.position,
                        clubName: club.name,
                        teamName: team.name
                    };
                });
                const mapped = await Promise.all(pArray);
                let sorted = mapped.filter((a) => {return a != null && a != undefined }).sort((a, b) => {return b.watchedTotal - a.watchedTotal});

                let fileName = `${key}_leaderboard.csv`;
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
                            subject: key.toUpperCase() + ' Leaderboard Report',
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
        });
    } catch (error) {
        console.error(error);
    }
}


var StatsJob = {
    register: function () {
        var cronJob = cron.job('0 0 * * 5', callback); // Every Friday
        // var cronJob = cron.job('0-59 * * * *', callback); // For Dev. Runs every 1 minute
        cronJob.start();
    }
}
module.exports = StatsJob;
