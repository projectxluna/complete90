const mongoose = require('mongoose');
const User = require('./models/user');
const Auth = require('./helpers/auth');
const Plan = require('./models/plan');
const WatchedStats = require('./models/stats');
const Assignment = require('./models/assignment');

const getTeamAssignment = (teamId) => {
    let query = {
        forTeams: mongoose.Types.ObjectId(teamId)
    }
    return Assignment.find(query).sort({ _id: -1 }).lean().exec();
}

const getPlayerAssignment = (playerId) => {
    let query = {
        forPlayers: mongoose.Types.ObjectId(playerId)
    }
    return Assignment.find(query).sort({ _id: -1 }).lean().exec();
}

const getWatchedStats = (assignmentIds = [], playerId) => {
    return WatchedStats.aggregate([
        {
            $match: {
                userId: playerId,
                assignmentId: {
                    $in: assignmentIds
                }
            }
        },
        {
            $group: {
                _id: {
                    contentId: '$content.id',
                    assignmentId: '$assignmentId'
                },
                userId: { $first: '$userId' },
                assignmentId: { $first: '$assignmentId' },
                watchedTotal: { $sum: '$content.watchedTotal' },
                contentLength: { $first: '$content.contentLength' }
            }
        }
    ]).exec();
}

const getPlans = (planIds = []) => {
    let query = {
        _id: {
            $in: planIds
        }
    }
    return Plan.find(query).exec();
}

const mapAssignment = (assignment, mapedPlans, mapedStats) => {
    let plan = mapedPlans[assignment.planId] || [];
    let stats = mapedStats[assignment._id];
    if (!stats) {
        return {
            contentName: plan.name,
            createdAt: assignment.createdAt,
            dueDate: assignment.endDate,
            contentLength: 0,
            completion: 0
        };
    }
    let percents = plan.detailedContent.map(c => {
        let multi = (c.reps * c.sets) || 1;
        let stat = stats.find(s => c.contentId === s.content.id);
        if (!stat) {
            return 0;
        }
        let watchedTotalMillis = stat.content.watchedTotal;
        let contentLength = stat.content.contentLength * multi;
        let p = Math.floor(watchedTotalMillis / 1000) / Math.ceil(contentLength);
        return p > 1 ? 1 : p;
    });
    let avg = percents.reduce((acc, cur) => acc + cur) / percents.length;
    let totalReps = plan.detailedContent.map(d => d.reps).reduce((acc, cur) => acc + cur);
    let totalSets = plan.detailedContent.map(d => d.sets).reduce((acc, cur) => acc + cur);
    let multi = (totalReps * totalSets) || 1;
    let totalLength = (stats.map(s => s.content.contentLength).reduce((acc, cur) => acc + cur) || 1) * multi;

    let returnValue = {
        percents: percents,
        contentName: plan.name, // assignment name
        createdAt: assignment.createdAt,
        dueDate: assignment.endDate,
        contentLength: totalLength,
        completion: avg
    };
    return returnValue;
}

module.exports = function (apiRoutes) {

    apiRoutes.get('/report/assignment', Auth.isAuthenticated, async (req, res) => {
        const { playerId } = req.query

        if (!playerId) {
            return res.status(400).send('Require player id');
        }
        try {
            let player = await User.findById(playerId).exec();
            let playerAssignments = await getPlayerAssignment(player._id) || [];
            let teamAssignments = await getTeamAssignment(player.teamId) || [];

            let assignmentIds = playerAssignments.map(a => a._id).concat(teamAssignments.map(a => a._id));
            let mapedStats = {};
            let watchedStats = await getWatchedStats(assignmentIds, player._id);
            watchedStats.map(stat => {
                stat.content = {
                    id: stat._id.contentId,
                    watchedTotal: stat.watchedTotal,
                    contentLength: stat.contentLength
                };
                if (!mapedStats[stat.assignmentId]) {
                    mapedStats[stat.assignmentId] = [stat];
                } else {
                    mapedStats[stat.assignmentId].push(stat);
                }
            });
            let planIds = playerAssignments.map(a => a.planId).concat(teamAssignments.map(a => a.planId));
            let mapedPlans = {};
            let plans = await getPlans(planIds);
            plans.map(p => mapedPlans[p._id] = p);

            let stats = {
                player: playerAssignments.map(assignment => mapAssignment(assignment, mapedPlans, mapedStats)),
                team: teamAssignments.map(assignment => mapAssignment(assignment, mapedPlans, mapedStats))
            }
            res.json({ success: true, stats });
        } catch (error) {
            console.log(error);
            return res.status(400).send({
                success: false,
                error: error
            });
        }
    });
};
