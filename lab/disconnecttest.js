const axios = require('axios').default;

// Discogs info
const DISCOGS_API_KEY = 'QmMqPrQDitHQDZpPdyIB';
const DISCOGS_API_SECRET = 'TrPSisogDAvEqrzXlpizykozdMkWWBWO';
const callback_url = 'https://webhook.site/fdb8d988-7416-4077-8bbc-c781fd2251b2';
const oauth_token = 'QXYDMCLbogrJAVccazguAWLlXVmwybvefvKYiitF';
const oauth_token_secret = 'qrQLjIVZptMLEChIJljWNgGRxFyLnpgUQUZcWTQD';
const oauth_verifier = 'YTkBEihImw';

var Discogs = require('disconnect').Client;

// Authenticate by consumer key and secret
var dis = new Discogs({
	consumerKey: 'YOUR_CONSUMER_KEY', 
	consumerSecret: 'YOUR_CONSUMER_SECRET'
});

// app.get('/authorize', function(req, res){
// 	var oAuth = new Discogs().oauth();
// 	oAuth.getRequestToken(
// 		'YOUR_CONSUMER_KEY', 
// 		'YOUR_CONSUMER_SECRET', 
// 		'http://your-script-url/callback', 
// 		function(err, requestData){
// 			// Persist "requestData" here so that the callback handler can 
// 			// access it later after returning from the authorize url
// 			res.redirect(requestData.authorizeUrl);
// 		}
// 	);
// });

// var db = new Discogs().database();
// db.getRelease(176126, function(err, data){
// 	console.log(data);
// });

// var oAuth = new Discogs().oauth();
// 	oAuth.getRequestToken(
// 		DISCOGS_API_KEY, 
// 		DISCOGS_API_SECRET,
//         '',  
// 		function(err, requestData){
            
// 		}
// 	)
let auth = {};
auth.consumerKey = DISCOGS_API_KEY;
auth.consumerSecret = DISCOGS_API_SECRET

async () => {
    var oAuth = new Discogs().oauth();
    await oAuth.getRequestToken(
        DISCOGS_API_KEY,
        DISCOGS_API_SECRET,
        '', 
        function(err, requestData){
            console.log('fat');
        }
    );
}

