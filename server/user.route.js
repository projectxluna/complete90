module.exports = function (apiRoutes) {
    var User = require('./models/user');
    
    /**
     * get user stats 
     */
    apiRoutes.get('/user/stats', function (req, res) {
        
    });

    /**
     * get created training plans
     */
    apiRoutes.get('/user/plans/', function (req, res) {

    });

    /**
     * create new plan(s)
     */
    apiRoutes.post('/user/plans/', function (req, res) {

    });

    /**
     * modify a training plan(s)
     */
    apiRoutes.put('/user/plans', function (req, res) {

    });
};
