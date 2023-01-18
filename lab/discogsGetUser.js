// GET https://api.discogs.com/oauth/identity
const axios = require('axios').default;

const baseUrl = 'https://api.discogs.com';
const identity_url = 'https://api.discogs.com/oauth/identity';
const search_url = 'https://api.discogs.com/database/search?release_title=nevermind&artist=nirvana&per_page=3&page=1';

const DISCOGS_CONSUMER_KEY = 'QmMqPrQDitHQDZpPdyIB';
const DISCOGS_CONSUMER_SECRET = 'TrPSisogDAvEqrzXlpizykozdMkWWBWO';

const oauth_token = 'aDgPKtoNZGHDuDpCdAqQibQMBFzohShagadrGBlI';
const oauth_secret = 'fVCNFmhwYjBTgOJNhxXQnCWcEmqWahHdELbxCYXl';
const oauth_verifier = 'nTAXsGXcft';

// Make a request for a user with a given ID

axios.get(identity_url, {
    headers: {
        "Content-Type" : "application/x-www-form-urlencoded",
        "Authorization" : '' +
            `OAuth oauth_consumer_key=\"${DISCOGS_CONSUMER_KEY}\",` +
            `oauth_nonce=\"${Date.now()}\",` +
            `oauth_token=\"${oauth_token}\",` +
            `oauth_signature=\"${DISCOGS_CONSUMER_SECRET}&${oauth_secret}\",` +
            `oauth_signature_method=\"PLAINTEXT\",` +
            `oauth_timestamp=\"${Date.now()}\",`
    },
})
.catch(error => {

  console.log(error);
	if (error.response) {
    return
		//response status is an error code
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.statusText);
        console.log(error.response.headers);
	}
	else if (error.request) {
		//response not received though the request was sent
		console.log(error.request);
	}
	else {
		//an error occurred when setting up the request
		console.log(error.message);
	}
});