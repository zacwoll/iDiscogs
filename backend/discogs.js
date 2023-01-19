// imports
const axios = require('axios').default;
import * as crypto from './crypto';

// Discogs API information
// API AND API SECRET will come in through a .env file
const DISCOGS_API_KEY = 'QmMqPrQDitHQDZpPdyIB';
const DISCOGS_API_SECRET = 'TrPSisogDAvEqrzXlpizykozdMkWWBWO';

// These are URLS that are important to the discogs ecosystem
const DISCOGS_OAUTH_REQUEST_TOKEN_URL = 'https://api.discogs.com/oauth/request_token';
const DISCOGS_OAUTH_AUTHENTICATE_TOKEN_URL = 'https://discogs.com/oauth/authorize?oauth_token='
const DISCOGS_OAUTH_POST_URL = 'https://api.discogs.com/oauth/access_token';

const callback_url = "";

// Get OAuth Token from api.discogs.com
// Requests and retrieves an initial 'request' Oauth Token from Discogs API
// Returns encrypted oauth object
// { oauth_token, oauth_token_secret }
export async function getOauthToken(api_key, api_secret, oauth_url, callback_url) {
    const response = await axios.get(oauth_url, {
        headers: {
            "Content-Type" : "application/x-www-form-urlencoded",
            "Authorization" : `OAuth oauth_consumer_key=\"${api_key}\",` +
                `oauth_nonce=\"${Date.now()}\",` +
                `oauth_signature=\"${api_secret}&\",` +
                `oauth_signature_method=\"PLAINTEXT\",` +
                `oauth_timestamp=\"${Date.now()}\",` +
                `oauth_callback=\"${callback_url}\"`
        },
    })

    let [oauth_token, oauth_token_secret, oauth_callback_confirmed] = response.data.split('&');

    oauth_token = oauth_token.split('=')[1];
    oauth_token = crypto.encrypt(oauth_token);

    oauth_token_secret = oauth_token_secret.split('=')[1];
    oauth_token_secret = crypto.encrypt(oauth_token_secret);

    // Return now encrypted tokens, decrypt as necessary
    return {oauth_token, oauth_token_secret}
}

// POST the now-verified token
// This function posts a complete set of access request keys to discogs API
export async function postVerificationToken(api_key, api_secret, oauth_token, oauth_secret, oauth_verifier) {
    const request = {
        method: 'POST',
        url: DISCOGS_OAUTH_POST_URL,
        headers: {
            "Content-Type" : "application/x-www-form-urlencoded",
            "Authorization" : '' +
                `OAuth oauth_consumer_key=\"${api_key}\",` +
                `oauth_nonce=\"${Date.now()}\",` +
                `oauth_token=\"${oauth_token}\",` +
                `oauth_signature=\"${api_secret}&${oauth_secret}\",` +
                `oauth_signature_method=\"PLAINTEXT\",` +
                `oauth_timestamp=\"${Date.now()}\",` +
                `oauth_verifier=\"${oauth_verifier}\"`
        },
    }
    console.log({request});
    const response = await axios(request);

    console.log("Authorizing User");
    return response;
}

// Test how to create an authorized request on getting a 200 response from 
// GET https://api.discogs.com/oauth/identity
// oauth 
export async function getIdentity(api_key, api_secret, oauth_token, oauth_secret, callback_url) {
    // This is the url but I'd like to create a more basic version of this that accepts a URL arg
    const IDENTITY_URL = 'https://api.discogs.com/oauth/identity';

    // console.log({oauth_verifier});
    const request = {
        method: 'GET',
        url: IDENTITY_URL,
        headers: {
            "Content-Type" : "application/x-www-form-urlencoded",
            "Authorization" : '' +
                `OAuth oauth_consumer_key=\"${api_key}\",` +
                `oauth_nonce=\"${Date.now()}\",` +
                `oauth_token=\"${oauth_token}\",` +
                `oauth_signature=\"${api_secret}&${oauth_secret}\",` +
                `oauth_signature_method=\"PLAINTEXT\",` +
                `oauth_timestamp=\"${Date.now()}\",` +
                `oauth_callback=\"${callback_url}\"`
        },
    }
    console.log({request});
    const response = await axios(request);

    console.log("Sent Authorized request.");
    return response;
}
