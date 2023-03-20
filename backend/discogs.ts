import axios, { AxiosResponse } from 'axios';
import * as crypto from './crypto';

// Discogs API information
// API AND API SECRET will come in through a .env file
const DISCOGS_API_KEY: string = process.env.DISCOGS_API_KEY!;
const DISCOGS_API_SECRET: string = process.env.DISCOGS_API_SECRET!;
const DISCOGS_OAUTH_POST_URL: string = 'https://api.discogs.com/oauth/access_token';
const callback_url: string = process.env.callback_url!;

interface OAuthToken {
  oauth_token: string;
  oauth_token_secret: string;
}

/**
 * Requests and retrieves an initial 'request' OAuth Token from Discogs API
 * @param oauth_url The Discogs OAuth URL
 * @returns Encrypted OAuth Token and OAuth Token Secret
 * { oauth_token, oauth_token_secret }
 */
export async function getOauthToken(oauth_url: string): Promise<OAuthToken> {
  const response = await axios.get(oauth_url, {
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
}

/**
 * Posts a complete set of access request keys to Discogs API
 * @param oauth_token OAuth Token
 * @param oauth_secret OAuth Token Secret
 * @param oauth_verifier OAuth Verifier
 * @returns Axios response
 */
export async function postVerificationToken(
  oauth_token: string,
  oauth_secret: string,
  oauth_verifier: string,
): Promise<AxiosResponse> {
  const request = {
    method: 'POST',
    url: DISCOGS_OAUTH_POST_URL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        `OAuth oauth_consumer_key="${DISCOGS_API_KEY}",` +
        `oauth_nonce="${Date.now()}",` +
        `oauth_token="${oauth_token}",` +
        `oauth_signature="${DISCOGS_API_SECRET}&${oauth_secret}",` +
        'oauth_signature_method="PLAINTEXT",' +
        `oauth_timestamp="${Date.now()}",` +
        `oauth_verifier="${oauth_verifier}"`,
    },
  };

  const response = await axios(request);

  console.log('Authorizing User');
  return response;
}

/**
 * Sends a GET request to the Discogs API to retrieve user identity
 * @param request_config Encrypted OAuth Token and OAuth Token Secret
 * @returns Axios response
 */
export async function getIdentity(request_config: OAuthToken): Promise<AxiosResponse> {
  // IDENTITY endpoint
  const IDENTITY_URL = 'https://api.discogs.com/oauth/identity';

  let request = configureRequest('GET', IDENTITY_URL, request_config);
  const response = await axios(request);

  console.log('Sent Request for Identity');
  return response;
}

interface RequestOptions {
    method: string; // The HTTP method to use for the request (e.g. "GET", "POST", "PUT")
    url: string; // The URL to send the request to
    params?: Record<string, string>; // Optional object containing any query string parameters to send with the request
    data?: Record<string, string>; // Optional object containing any data to send in the body of the request (e.g. for a POST request)
    headers?: Record<string, string>; // Optional object containing any headers to send with the request
}
  

/**
 * Configure an HTTP request with the given method, URL, and authentication token.
 *
 * @param method - The HTTP method to use for the request (e.g. "GET", "POST", "PUT").
 * @param url - The URL to send the request to.
 * @param config - An authentication token to use for the request.
 * @returns A RequestOptions object containing the configured HTTP request.
 */
export function configureRequest(method: string, url: string, config: OAuthToken): RequestOptions {
    // Create a new RequestOptions object with the method and URL provided
    let request: RequestOptions = {
      method: method,
      url: url,
    }
  
    // Set the headers for the request using the given authentication token
    request.headers = configureHeaders(config);
  
    // Return the fully-configured RequestOptions object
    return request;
  }

// Define the headers to be sent with the request
export function configureHeaders(oAuthToken: OAuthToken) {
// Define an object to hold the headers
const headers: {[key: string]: string} = {
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

// Define an interface for the Discogs search result
interface DiscogsSearchResult {
results: DiscogsSearchItem[];
pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
};
}

// Define an interface for a Discogs search item
interface DiscogsSearchItem {
    id: number;
    title: string;
    year: number;
    cover_image: string;
    resource_url: string;
}

// Define a function to search for Discogs items
export async function search(query: string): Promise<DiscogsSearchItem[]> {
// Make a GET request to the Discogs API search endpoint
const response = await axios.get<DiscogsSearchResult>('https://api.discogs.com/database/search', {
    // Set the request parameters
    params: {
    q: query,        // The search query
    type: 'master',  // The type of item to search for (masters)
    per_page: 10,    // The number of results to return per page
    page: 1,         // The page number of results to return
    },
});

if (response.status != 200) {
  console.error(response.statusText);
}


// Return the search results from the response data
return response.data.results;
}
