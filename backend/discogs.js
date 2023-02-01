require('dotenv').config()

// imports
const axios = require('axios').default;
import * as crypto from './crypto';

// Discogs API information
// API AND API SECRET will come in through a .env file
const DISCOGS_API_KEY = process.env.DISCOGS_API_KEY;
const DISCOGS_API_SECRET = process.env.DISCOGS_API_SECRET;

const DISCOGS_OAUTH_POST_URL = 'https://api.discogs.com/oauth/access_token';
const callback_url = process.env.callback_url;

// Get OAuth Token from api.discogs.com
// Requests and retrieves an initial 'request' Oauth Token from Discogs API
// Returns encrypted oauth object
// { oauth_token, oauth_token_secret }
export async function getOauthToken(oauth_url) {
    const response = await axios.get(oauth_url, {
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

    let [oauth_token, oauth_token_secret] = response.data.split('&');

    oauth_token = oauth_token.split('=')[1];
    oauth_token = crypto.encrypt(oauth_token).data;

    oauth_token_secret = oauth_token_secret.split('=')[1];
    oauth_token_secret = crypto.encrypt(oauth_token_secret).data;

    // Return now encrypted tokens, decrypt as necessary
    return {oauth_token, oauth_token_secret}
}

// POST the now-verified token
// This function posts a complete set of access request keys to discogs API
export async function postVerificationToken(oauth_token, oauth_secret, oauth_verifier) {
    const request = {
        method: 'POST',
        url: DISCOGS_OAUTH_POST_URL,
        headers: {
            "Content-Type" : "application/x-www-form-urlencoded",
            "Authorization" : '' +
                `OAuth oauth_consumer_key=\"${DISCOGS_API_KEY}\",` +
                `oauth_nonce=\"${Date.now()}\",` +
                `oauth_token=\"${oauth_token}\",` +
                `oauth_signature=\"${DISCOGS_API_SECRET}&${oauth_secret}\",` +
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
export async function getIdentity(request_config) {
    // IDENTITY endpoint
    const IDENTITY_URL = 'https://api.discogs.com/oauth/identity';

    let request = configureRequest('GET', IDENTITY_URL, request_config);
    const response = await axios(request);

    console.log('Sent Request for Identity');
    return response;
}

/*
    configure an authorized request for discogs, before putting data in it
    This is a function intended to make easier requests from discogs
    THis is a premade request with the right headers the first time, not configuring them on the fly
*/
export function configureRequest(method, url, config) {
    let request = {
        method: method,
        url: url,
    }
    request.headers = configureHeaders(config.oauth_token, config.oauth_secret);

    return request;
}

/*
    Configure the headers for an authorized request
*/
export function configureHeaders(oauth_token, oauth_secret) {
    let headers = {
            "Content-Type" : "application/x-www-form-urlencoded",
            "Authorization" : '' +
                `OAuth oauth_consumer_key=\"${DISCOGS_API_KEY}\",` +
                `oauth_nonce=\"${Date.now()}\",` +
                `oauth_token=\"${oauth_token}\",` +
                `oauth_signature=\"${DISCOGS_API_SECRET}&${oauth_secret}\",` +
                `oauth_signature_method=\"PLAINTEXT\",` +
                `oauth_timestamp=\"${Date.now()}\",` +
                `oauth_callback=\"${callback_url}\"`
        };
    return headers;
}

/*
https://api.discogs.com/database/search?q={query}&
    \{?
        type, - [release, master, artist, label]
        title, 
        release_title,
        credit,artist,
        anv,
        label,
        genre,
        style,
        country,
        year,
        format,
        catno,
        barcode,
        track,
        submitter,
        contributor
    }
ex: https://api.discogs.com/database/search?release_title=nevermind&artist=nirvana&per_page=3&page=1
*/
export function generateQueryUrl(prefix, query) {
    let url = prefix + 'q=' + query.query;
    for (const [key, value] of Object.entries(query)) {
        if (key != 'query') {
            if (value !== '') {
                url += `&${key}=${value}`;
            }
        }
      }
      return url;
}

export async function search(request_config, query) {
    // This is the url but I'd like to create a more basic version of this that accepts a URL arg
    const SEARCH_URL = 'https://api.discogs.com/database/search?';

    const url = generateQueryUrl(SEARCH_URL, query);

    let request = configureRequest('GET', url, request_config);

    console.log(request);
    const response = await axios(request);

    console.log("Sent Authorized request.");
    return response;
}