const auth_url = 'https://api.discogs.com/oauth/access_token';

const axios = require('axios').default;

const oauth_token = 'znvNtaPXJFQbnOlhNsjEIPgwLHFUvtnnpwhfHilJ';
const oauth_secret = 'worthHULTCJrYKBcILFEHUgrUFrOivomzvMFGBwr';
const oauth_verifier = 'vsaYGszJzc';

const DISCOGS_CONSUMER_KEY = 'QmMqPrQDitHQDZpPdyIB';
const DISCOGS_CONSUMER_SECRET = 'TrPSisogDAvEqrzXlpizykozdMkWWBWO';

axios({
    method: 'POST',
    url: auth_url,
    headers: {
        "Content-Type" : "application/x-www-form-urlencoded",
        "Authorization" : '' +
            `OAuth oauth_consumer_key=\"${DISCOGS_CONSUMER_KEY}\",` +
            `oauth_nonce=\"${Date.now()}\",` +
            `oauth_token=\"${oauth_token}\",` +
            `oauth_signature=\"${DISCOGS_CONSUMER_SECRET}&${oauth_secret}\",` +
            `oauth_signature_method=\"PLAINTEXT\",` +
            `oauth_timestamp=\"${Date.now()}\",` +
            `oauth_verifier=\"${oauth_verifier}\"`
    },
})
  .then(function (response) {
    // handle success
    console.log(response.status, response._headers);  
  })