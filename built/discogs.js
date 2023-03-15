var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
export function getOauthToken(oauth_url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios.get(oauth_url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `OAuth oauth_consumer_key="${DISCOGS_API_KEY}",` +
                    `oauth_nonce="${Date.now()}",` +
                    `oauth_signature="${DISCOGS_API_SECRET}&",` +
                    'oauth_signature_method="PLAINTEXT",' +
                    `oauth_timestamp="${Date.now()}",` +
                    `oauth_callback="${callback_url}"`,
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
export function postVerificationToken(oauth_token, oauth_secret, oauth_verifier) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = {
            method: 'POST',
            url: DISCOGS_OAUTH_POST_URL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `OAuth oauth_consumer_key="${DISCOGS_API_KEY}",` +
                    `oauth_nonce="${Date.now()}",` +
                    `oauth_token="${oauth_token}",` +
                    `oauth_signature="${DISCOGS_API_SECRET}&${oauth_secret}",` +
                    'oauth_signature_method="PLAINTEXT",' +
                    `oauth_timestamp="${Date.now()}",` +
                    `oauth_verifier="${oauth_verifier}"`,
            },
        };
        console.log({ request });
        const response = yield axios(request);
        console.log('Authorizing User');
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
export function configureRequest(method, url, config) {
    let request = {
        method: method,
        url: url,
    };
    request.headers = configureHeaders(config);
    return request;
}
/*
    Configure the headers for an authorized request
*/
export function configureHeaders(oAuthToken) {
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
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
export function search(query) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios.get('https://api.discogs.com/database/search', {
            params: {
                q: query,
                type: 'master',
                per_page: 10,
                page: 1,
            },
        });
        return response.data.results;
    });
}
