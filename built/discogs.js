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
/**
 * Requests and retrieves an initial 'request' OAuth Token from Discogs API
 * @param oauth_url The Discogs OAuth URL
 * @returns Encrypted OAuth Token and OAuth Token Secret
 * { oauth_token, oauth_token_secret }
 */
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
/**
 * Posts a complete set of access request keys to Discogs API
 * @param oauth_token OAuth Token
 * @param oauth_secret OAuth Token Secret
 * @param oauth_verifier OAuth Verifier
 * @returns Axios response
 */
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
        const response = yield axios(request);
        console.log('Authorizing User');
        return response;
    });
}
/**
 * Sends a GET request to the Discogs API to retrieve user identity
 * @param request_config Encrypted OAuth Token and OAuth Token Secret
 * @returns Axios response
 */
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
/**
 * Configure an HTTP request with the given method, URL, and authentication token.
 *
 * @param method - The HTTP method to use for the request (e.g. "GET", "POST", "PUT").
 * @param url - The URL to send the request to.
 * @param config - An authentication token to use for the request.
 * @returns A RequestOptions object containing the configured HTTP request.
 */
export function configureRequest(method, url, config) {
    // Create a new RequestOptions object with the method and URL provided
    let request = {
        method: method,
        url: url,
    };
    // Set the headers for the request using the given authentication token
    request.headers = configureHeaders(config);
    // Return the fully-configured RequestOptions object
    return request;
}
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
// Define a function to search for Discogs items
export function search(query) {
    return __awaiter(this, void 0, void 0, function* () {
        // Make a GET request to the Discogs API search endpoint
        const response = yield axios.get('https://api.discogs.com/database/search', {
            // Set the request parameters
            params: {
                q: query,
                type: 'master',
                per_page: 10,
                page: 1, // The page number of results to return
            },
        });
        // Return the search results from the response data
        return response.data.results;
    });
}
