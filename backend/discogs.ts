// Load environment variables from a .env file with `dotenv`
import * as dotenv from 'dotenv';
dotenv.config();

// imports
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as crypto from './crypto';

// Discogs API information
// API AND API SECRET will come in through a .env file
const DISCOGS_API_KEY: string = process.env.DISCOGS_API_KEY!;
const DISCOGS_API_SECRET: string = process.env.DISCOGS_API_SECRET!;
const DISCOGS_OAUTH_POST_URL: string = 'https://api.discogs.com/oauth/access_token';
const callback_url: string = process.env.callback_url!;

export interface OAuthToken {
    oauth_token: string;
    oauth_token_secret: string;
  }
  
interface Request {
    method: string;
    url: string;
    headers: Headers;
  }
  
  interface Headers {
    "Content-Type": string;
    "Authorization": string;
  }

// Get OAuth Token from api.discogs.com
// Requests and retrieves an initial 'request' Oauth Token from Discogs API
// Returns encrypted oauth object
// { oauth_token, oauth_token_secret }
// Is there a custom oauth_url? (yes)
// https://api.discogs.com/oauth/request_token
export async function getOauthToken() : Promise<OAuthToken> {
    const oauth_url = 'https://api.discogs.com/oauth/request_token';
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

export interface OAuthVerifier {
    request_token: string,
    request_token_secret: string,
    verification_code: string,
}



// POST the now-verified token
// This function posts a complete set of access request keys to discogs API
export async function postVerificationToken(verification_token: OAuthVerifier) {
    const request = {
        method: 'POST',
        url: DISCOGS_OAUTH_POST_URL,
        headers: {
            "Content-Type" : "application/x-www-form-urlencoded",
            "Authorization" : '' +
                `OAuth oauth_consumer_key=\"${DISCOGS_API_KEY}\",` +
                `oauth_nonce=\"${Date.now()}\",` +
                `oauth_token=\"${verification_token.request_token}\",` +
                `oauth_signature=\"${DISCOGS_API_SECRET}&${verification_token.request_token_secret}\",` +
                `oauth_signature_method=\"PLAINTEXT\",` +
                `oauth_timestamp=\"${Date.now()}\",` +
                `oauth_verifier=\"${verification_token.verification_code}\"`
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
export async function getIdentity(request_config: OAuthToken) {
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

  // Technically method is ['GET', 'PUT', 'POST', 'DELETE'] idk of any others
  // url is always going be some string representation of a web address

export function configureRequest(method: string, url: string, config: OAuthToken) : AxiosRequestConfig  {
    let request: AxiosRequestConfig  = {
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
export function configureHeaders(oAuthToken: OAuthToken) {
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
export function generateQueryUrl(prefix : string, query : Object) {
    let url = prefix;
    for (const [key, value] of Object.entries(query)) {
        if (value !== '') {
            url += `&${key}=${value}`;
        }
      }
      console.log(url);
      return url;
}

// Oauth_token & Oauth_token_secret
// This results in an object that looks like { pagination: {}, results: {} }

import { AxiosError } from 'axios';

type ApiResponse = {
  pagination: {},
  results: {}
};

type ApiResult = ApiResponse | AxiosError;


export async function search(request_config: OAuthToken, query : Object) : Promise<AxiosResponse<ApiResponse>> {

    // This is the url but I'd like to create a more basic version of this that accepts a URL arg
    const SEARCH_URL = 'https://api.discogs.com/database/search?';

    const url = generateQueryUrl(SEARCH_URL, query);

    let request = configureRequest('GET', url, request_config);

    return axios(request);
}