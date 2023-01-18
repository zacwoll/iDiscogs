const axios = require('axios').default;

const DISCOGS_API_KEY = 'QmMqPrQDitHQDZpPdyIB';
const DISCOGS_API_SECRET = 'TrPSisogDAvEqrzXlpizykozdMkWWBWO';
const DISCOGS_OAUTH_REQUEST_TOKEN_URL = 'https://api.discogs.com/oauth/request_token';
const DISCOGS_OAUTH_AUTHENTICATE_TOKEN_URL = 'https://discogs.com/oauth/authorize?oauth_token='

const callback_url = 'https://webhook.site/fdb8d988-7416-4077-8bbc-c781fd2251b2';

axios.interceptors.request.use(config => {
    // log a message before any HTTP request is sent
    console.log('Request was sent');
  
    return config;
  });

function AuthGetToken(DISCOGS_API_KEY);
// Make a request for a user with a given ID
axios.get(DISCOGS_OAUTH_REQUEST_TOKEN_URL, {
    headers: {
        "Content-Type" : "application/x-www-form-urlencoded",
        "Authorization" : `OAuth oauth_consumer_key=\"${DISCOGS_API_KEY}\",` +
            `oauth_nonce=\"${Date.now()}\",` +
            `oauth_signature=\"${DISCOGS_API_SECRET}&\",` +
            `oauth_signature_method=\"PLAINTEXT\",` +
            `oauth_timestamp=\"${Date.now()}\",` +
            `oauth_callback=\"${callback_url}\"`
    },
})
  .then(function (response) {
    let [oauth_token, oauth_token_secret, oauth_callback_confirmed] = response.data.split('&');
    oauth_token = oauth_token.split('=')[1];
    oauth_token_secret = oauth_token_secret.split('='[1]);
    // handle success
    console.log(`oauth_token  =  ${oauth_token}`);
    console.log(`oauth_token_secret  =  ${oauth_token_secret}`);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
    // always executed
  });

// Make an OAuth request
// GET https://api.discogs.com/oauth/request_token

// Capture creds

// Search on Discogs