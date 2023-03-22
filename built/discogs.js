var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Load environment variables from a .env file with `dotenv`
import * as dotenv from 'dotenv';
dotenv.config();
// imports
import axios from 'axios';
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
// Is there a custom oauth_url? (yes)
// https://api.discogs.com/oauth/request_token
export function getOauthToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const oauth_url = 'https://api.discogs.com/oauth/request_token';
        const response = yield axios.get(oauth_url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `OAuth oauth_consumer_key=\"${DISCOGS_API_KEY}\",` +
                    `oauth_nonce=\"${Date.now()}\",` +
                    `oauth_signature=\"${DISCOGS_API_SECRET}&\",` +
                    `oauth_signature_method=\"PLAINTEXT\",` +
                    `oauth_timestamp=\"${Date.now()}\",` +
                    `oauth_callback=\"${callback_url}\"`
            },
        });
        let [oauth_token, oauth_token_secret] = response.data.split('&');
        oauth_token = oauth_token.split('=')[1];
        oauth_token = crypto.encrypt(oauth_token).data;
        oauth_token_secret = oauth_token_secret.split('=')[1];
        oauth_token_secret = crypto.encrypt(oauth_token_secret).data;
        // Return now encrypted tokens, decrypt as necessary
        return { oauth_token, oauth_token_secret };
    });
}
// POST the now-verified token
// This function posts a complete set of access request keys to discogs API
export function postVerificationToken(verification_token) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = {
            method: 'POST',
            url: DISCOGS_OAUTH_POST_URL,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": '' +
                    `OAuth oauth_consumer_key=\"${DISCOGS_API_KEY}\",` +
                    `oauth_nonce=\"${Date.now()}\",` +
                    `oauth_token=\"${verification_token.request_token}\",` +
                    `oauth_signature=\"${DISCOGS_API_SECRET}&${verification_token.request_token_secret}\",` +
                    `oauth_signature_method=\"PLAINTEXT\",` +
                    `oauth_timestamp=\"${Date.now()}\",` +
                    `oauth_verifier=\"${verification_token.verification_code}\"`
            },
        };
        console.log({ request });
        const response = yield axios(request);
        console.log("Authorizing User");
        return response;
    });
}
// Test how to create an authorized request on getting a 200 response from 
// GET https://api.discogs.com/oauth/identity
// oauth 
export function getIdentity(request_config) {
    return __awaiter(this, void 0, void 0, function* () {
        // IDENTITY endpoint
        const IDENTITY_URL = 'https://api.discogs.com/oauth/identity';
        let request = configureRequest('GET', IDENTITY_URL, request_config);
        const response = yield axios(request);
        console.log('Sent Request for Identity');
        return response;
    });
}
/*
    configure an authorized request for discogs, before putting data in it
    This is a function intended to make easier requests from discogs
    THis is a premade request with the right headers the first time, not configuring them on the fly
*/
// Technically method is ['GET', 'PUT', 'POST', 'DELETE'] idk of any others
// url is always going be some string representation of a web address
export function configureRequest(method, url, config) {
    let request = {
        method: method,
        url: url,
        headers: configureHeaders(config),
    };
    return request;
}
/*
    Configure the headers for an authorized request
*/
// Define the headers to be sent with the request
export function configureHeaders(oAuthToken) {
    // Define an object to hold the headers
    const headers = {
        // Set the Content-Type header to 'application/x-www-form-urlencoded'
        "Content-Type": "application/x-www-form-urlencoded",
        // Set the Authorization header to contain the OAuth parameters
        "Authorization": `OAuth oauth_consumer_key=\"${DISCOGS_API_KEY}\",` +
            `oauth_nonce=\"${Date.now()}\",` +
            `oauth_token=\"${oAuthToken.oauth_token}\",` +
            `oauth_signature=\"${DISCOGS_API_SECRET}&${oAuthToken.oauth_token_secret}\",` +
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
    let url = prefix;
    for (const [key, value] of Object.entries(query)) {
        if (value !== '') {
            url += `&${key}=${value}`;
        }
    }
    console.log(url);
    return url;
}
export function search(request_config, query) {
    return __awaiter(this, void 0, void 0, function* () {
        // This is the url but I'd like to create a more basic version of this that accepts a URL arg
        const SEARCH_URL = 'https://api.discogs.com/database/search?';
        const url = generateQueryUrl(SEARCH_URL, query);
        let request = configureRequest('GET', url, request_config);
        return axios(request);
        // console.log(request);
        // try {
        //     const response = await axios(request);
        //     console.log("Sent Authorized request.");
        //     return response;
        // } catch (error) {
        //     throw error;
        // }
    });
}
