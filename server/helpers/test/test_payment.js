var Paypal = require('../payment');

Paypal.getClientToken(function (token) {
	console.log('client_token:', token);
	Paypal.createSubscription(token, 't29r', function(err, result) {
		console.log(result);
	});
	// Paypal.getPlansAvailable(function (plans) {
	// 	console.log('plans:', plans);
	// });
});
