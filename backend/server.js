const express = require('express')

import * as discogs from './discogs';
import * as my_crypto from './crypto';

// Express options
const app = express()
const port = 3000;

// Allows body parsing
app.use(express.urlencoded({extended: false}));

// Allows cookies to be understood by the server
const cookieParser = require('cookie-parser')

// lets you use the cookieParser in your application
app.use(cookieParser());

const path = require('path');
const axios = require('axios').default;

// Discogs API information
const DISCOGS_API_KEY = 'QmMqPrQDitHQDZpPdyIB';
const DISCOGS_API_SECRET = 'TrPSisogDAvEqrzXlpizykozdMkWWBWO';
const DISCOGS_OAUTH_REQUEST_TOKEN_URL = 'https://api.discogs.com/oauth/request_token';
const DISCOGS_OAUTH_AUTHENTICATE_TOKEN_URL = 'https://discogs.com/oauth/authorize?oauth_token='
const callback_url = "";

const AUTH_URL = 'https://api.discogs.com/oauth/access_token';

// Set up the public assets
app.use(express.static('public'));
app.set('views', path.join(__dirname, '/frontend/views'));
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
    const cookies = req.cookies;
    if (cookies.request_token) {
        res.redirect('/auth');
    } 
    else if (cookies.oauth_token) {
        const {data} = await discogs.getIdentity(
            DISCOGS_API_KEY,
            DISCOGS_API_SECRET,
            decrypt(req.cookies.oauth_token),
            decrypt(req.cookies.oauth_token_secret),
            '');

        res.render('identity', {username: data.username});
    }
    else {
        res.redirect('/new_user');
    }
 
    // Else the app lives here
    try {
        // App
    }
    catch (error) {
        // Catch
    }
    finally {
        console.log('Goodbye from /');
    }
  });

// the /auth page will send up the verfication code entering page auth.pug
// fire the post request with the cookie's verifier

app.get('/auth', async (req, res) => {
    try {
        if (req.cookies.request_token) {
            res.render('auth', {});
        } else {
            res.render('401', {});
        }

    } catch (error) {
        console.log({error});
    } finally {
        console.log("Goodbye from /auth GET");
    }
});

// the /auth page will POST the verification
app.post('/auth', async (req, res) => {

    // This is intended to come from the /auth page, which creates this token in this manner
    if (!req.body.token) {
        console.log('request has no verification token in the body');
        return;
    }

    const request_token = my_crypto.decrypt(req.cookies.request_token);
    const request_token_secret = my_crypto.decrypt(req.cookies.request_token_secret);
    const request_token_verifier = req.body.token;

    try {
        const {data, status, statusText} = await discogs.postVerificationToken(
            DISCOGS_API_KEY,
            DISCOGS_API_SECRET,
            request_token,
            request_token_secret,
            request_token_verifier);
        // data is the axios styled response
        console.log({data, status, statusText});

        // set new oauth_token and secret from incoming data
        let [oauth_token, oauth_token_secret] = data.split('&');
        oauth_token = oauth_token.split('=')[1];
        oauth_token_secret = oauth_token_secret.split('=')[1];

        res.cookie('oauth_token', my_crypto.encrypt(oauth_token));
        res.cookie('oauth_token_secret', my_crypto.encrypt(oauth_token_secret));

        if (status === 200) {
            console.log("Success! User authorized")
            // Clear the request token
            res.clearCookie('request_token');
            res.clearCookie('request_token_secret');
            // redirect to identity
            res.redirect('/identity');
        }
    }
    catch (error) {
        console.log(error);
    }
    finally {
        console.log("Goodbye from /auth POST");
    }
});

// Show Identity
app.get('/identity', async (req, res) => {
    console.log("GET /identity started");
    const cookies = req.cookies;
    if (!cookies.oauth_token || !cookies.oauth_token_secret) {
        if (!cookies.request_token) {
            res.redirect('/new_user');
        } else {
            res.redirect('/auth');
        }
    }

    try {
        const cb = '/';
        // Get the identity data
        const {data, status, statusText} = await discogs.getIdentity(
            DISCOGS_API_KEY,
            DISCOGS_API_SECRET,
            my_crypto.decrypt(req.cookies.oauth_token),
            my_crypto.decrypt(req.cookies.oauth_token_secret),
            cb);
        console.log({data, status, statusText});
        res.cookie('username', data.username);
        res.render('identity', {username: data.username});
    }
    catch (error) {
        console.log(error);
    }
    finally {
        console.log("Goodbye from /identity GET");
    }
});

// Give a new user a request oauth_token and secret cookie
app.get('/new_user', async (req, res) => {
    try {
        // Get request_oauth_token { request_oauth_token, request_oauth_secret }
        const oauth = await discogs.getOauthToken(DISCOGS_API_KEY, DISCOGS_API_SECRET, DISCOGS_OAUTH_REQUEST_TOKEN_URL, callback_url);
        // Add the token to the authentication url
        const oauthUrl = DISCOGS_OAUTH_AUTHENTICATE_TOKEN_URL + my_crypto.decrypt(oauth.oauth_token);
        
        // THis is a request oauth token, they send me a new one later
        // Set the encrypted oauth_token and encrypted oauth_token_secret cookies
        res.cookie('request_token', oauth.oauth_token);
        res.cookie('request_token_secret', oauth.oauth_token_secret);

        // Render index with the personal oauth_url link on the page
        res.render('index', { oauthUrl });
    } catch (error) {
        console.log({error})
    } finally {
        console.log("Goodbye from new_user");
    }
});

app.get('/clearCookies', (req, res) => {
    try {
        const cookies = req.cookies;
        for (const cookie in cookies) {
            res.clearCookie(cookie);
        }
        res.redirect('/new_user');
    }
    catch (error) {
        console.log(error);
    }
    finally {
        console.log("Cleared Cookies for user.");
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
 