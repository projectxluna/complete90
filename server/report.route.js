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
    return Assignment.find(query).sort({ _id: -1}).lean().exec();
}

const getPlayerAssignment = (playerId) => {
    let query = {
        forPlayers: mongoose.Types.ObjectId(playerId)
    }
    return Assignment.find(query).sort({ _id: -1}).lean().exec();
}

const getWatchedStats = (assignmentIds = []) => {
    let query = {
        assignmentId: {
            $in: assignmentIds
        }
    }
    return WatchedStats.find(query).exec();
}

const getPlans = (planIds = []) => {
    let query = {
        _id: {
            $in: planIds
        }
    }
    return Plan.find(query).exec();
}

const mapAssignment = (a, mapedPlans, mapedStats) => {
    let plan = mapedPlans[a.planId] || [];
    let stats = mapedStats[a._id];
    if (!stats) {
        return {
            contentName: plan.name,
            createdAt: a.createdAt,
            dueDate: a.endDate,
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
        let p = Math.floor(watchedTotalMillis/1000) / Math.ceil(contentLength);
        return p > 1 ? 1 : p;
    });
    let avg = percents.reduce((acc, cur) => acc + cur) / percents.length;
    let totalReps = plan.detailedContent.map(d => d.reps).reduce((acc, cur) => acc + cur);
    let totalSets = plan.detailedContent.map(d => d.sets).reduce((acc, cur) => acc + cur);
    let multi = (totalReps * totalSets) || 1;
    let totalLength = (stats.map(s => s.content.contentLength).reduce((acc, cur) => acc + cur) || 1) * multi;

    return {
        contentName: plan.name,
        createdAt: a.createdAt,
        dueDate: a.endDate,
        contentLength: totalLength,
        completion: avg
    };
}

module.exports = function (apiRoutes) {

    apiRoutes.get('/report/assignment', Auth.isAuthenticated, async (req, res) => {
        const {playerId} = req.query

        if (!playerId) {
            return res.status(400).send('Require player id');
        }
        try {
            let user = await User.findById(playerId).exec();
            let playerAssignments = await getPlayerAssignment(user._id) || [];
            let teamAssignments = await getTeamAssignment(user.teamId) || [];

            let assignmentIds = playerAssignments.map(a => a._id).concat(teamAssignments.map(a => a._id));
            let mapedStats = {};
            let watchedStats = await getWatchedStats(assignmentIds);
            watchedStats.map(stat => !mapedStats[stat.assignmentId] ? mapedStats[stat.assignmentId] = [stat] : mapedStats[stat.assignmentId].push(stat));
    
            let planIds = playerAssignments.map(a => a.planId).concat(teamAssignments.map(a => a.planId));
            let mapedPlans = {};
            let plans = await getPlans(planIds);
            plans.map(p => mapedPlans[p._id] = p);
    
            let stats = {
                player: playerAssignments.map(a => mapAssignment(a, mapedPlans, mapedStats)),
                team: teamAssignments.map(a => mapAssignment(a, mapedPlans, mapedStats))
            }
            res.json({ success: true, stats});
        } catch (error) {
            console.log(error);
            return res.status(400).send({
                success: false,
                error: error
            });
        }
    });
};
