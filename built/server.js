var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express'; // added types for express library
import cookieParser from 'cookie-parser'; // changed require to import 
import * as discogs from './discogs';
import * as crypto from './crypto';
import * as google from './google';
// Express options
const app = express(); // adding type to app const
const port = 3000;
// Allows body parsing
app.use(express.urlencoded({ limit: '50mb', extended: false }));
// Allows cookies to be understood by the server
app.use(cookieParser());
import path from 'path'; // converted require to import
// Discogs API information
const DISCOGS_OAUTH_REQUEST_TOKEN_URL = 'https://api.discogs.com/oauth/request_token';
const DISCOGS_OAUTH_AUTHENTICATE_TOKEN_URL = 'https://discogs.com/oauth/authorize?oauth_token=';
const AUTH_URL = 'https://api.discogs.com/oauth/access_token';
// Set up the public assets
app.use(express.static(path.join(__dirname, 'frontend/public')));
app.set('views', path.join(__dirname, '..', 'frontend', 'views'));
app.set('view engine', 'pug');
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = req.cookies;
    if (cookies.request_token) {
        res.redirect('/auth');
    }
    else if (cookies.oauth_token) {
        const { data } = yield discogs.getIdentity({
            oauth_token: crypto.decrypt(req.cookies.oauth_token),
            oauth_token_secret: crypto.decrypt(req.cookies.oauth_token_secret)
        });
        res.render('identity', { username: data.username });
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
}));
app.post('/requestAnnotation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(req.body);
    // 
    const fileData = req.body.data.substring(23);
    if (!req.body) {
        console.log('missing Data');
    }
    try {
        // make google request
        const annotation = yield google.getAnnotation(fileData);
        // console.log(JSON.stringify(annotation, null, 2));
        res.send({ annotation });
    }
    catch (error) {
        console.log(error);
    }
    finally {
        console.log("Goodbye from /upload POST");
    }
}));
app.post('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Hello from /search');
    let query = req.body.query;
    query = JSON.parse(query);
    if (!req.body) {
        console.log('missing Data');
    }
    try {
        const request_config = {
            oauth_token: crypto.decrypt(req.cookies.oauth_token),
            oauth_secret: crypto.decrypt(req.cookies.oauth_token_secret),
        };
        // make discogs request
        const { data, status, statusCode } = yield discogs.search(request_config, query);
        const pagination = data.pagination;
        const results = data.results;
        // console.log(data);
        console.log(JSON.stringify(data.results, null, 2));
        res.send(results);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        console.log("Goodbye from /upload POST");
    }
}));
// the /auth page will send up the verfication code entering page auth.pug
// fire the post request with the cookie's verifier
app.get('/auth', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.cookies.request_token) {
            res.render('auth', {});
        }
        else {
            res.render('401', {});
        }
    }
    catch (error) {
        console.log({ error });
    }
    finally {
        console.log("Goodbye from /auth GET");
    }
}));
// the /auth page will POST the verification
app.post('/auth', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // This is intended to come from the /auth page, which creates this token in this manner
    if (!req.body.token) {
        console.log('request has no verification token in the body');
        return;
    }
    const request_token = crypto.decrypt(req.cookies.request_token);
    const request_token_secret = crypto.decrypt(req.cookies.request_token_secret);
    const request_token_verifier = req.body.token;
    try {
        const { data, status, statusText } = yield discogs.postVerificationToken(request_token, request_token_secret, request_token_verifier);
        // data is the axios styled response
        console.log({ data, status, statusText });
        // set new oauth_token and secret from incoming data
        let [oauth_token, oauth_token_secret] = data.split('&');
        oauth_token = oauth_token.split('=')[1];
        oauth_token_secret = oauth_token_secret.split('=')[1];
        oauth_token = crypto.encrypt(oauth_token).data;
        res.cookie('oauth_token', oauth_token);
        oauth_token_secret = crypto.encrypt(oauth_token_secret).data;
        res.cookie('oauth_token_secret', oauth_token_secret);
        if (status === 200) {
            console.log("Success! User authorized");
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
}));
// Show Identity
app.get('/identity', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("GET /identity started");
    const cookies = req.cookies;
    if (!cookies.oauth_token || !cookies.oauth_token_secret) {
        if (!cookies.request_token) {
            res.redirect('/new_user');
        }
        else {
            res.redirect('/auth');
        }
    }
    try {
        const request_config = {
            oauth_token: crypto.decrypt(req.cookies.oauth_token),
            oauth_secret: crypto.decrypt(req.cookies.oauth_token_secret),
        };
        // Get the identity data
        const { data, status, statusText } = yield discogs.getIdentity(request_config);
        console.log({ data, status, statusText });
        res.cookie('username', data.username);
        res.render('identity', { username: data.username });
    }
    catch (error) {
        console.log(error);
    }
    finally {
        console.log("Goodbye from /identity GET");
    }
}));
// Give a new user a request oauth_token and secret cookie
app.get('/new_user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get request_oauth_token { request_oauth_token, request_oauth_secret }
        const oauth = yield discogs.getOauthToken(DISCOGS_OAUTH_REQUEST_TOKEN_URL);
        // Add the token to the authentication url
        const oauthUrl = DISCOGS_OAUTH_AUTHENTICATE_TOKEN_URL + crypto.decrypt(oauth.oauth_token, oauth.oauth_token_iv);
        // THis is a request oauth token, they send me a new one later
        // Set the encrypted oauth_token and encrypted oauth_token_secret cookies
        res.cookie('request_token', oauth.oauth_token);
        res.cookie('request_token_secret', oauth.oauth_token_secret);
        // Render index with the personal oauth_url link on the page
        res.render('new_user', { oauthUrl });
        // ENTRY POINT TEST
        // res.render('identity');
    }
    catch (error) {
        console.log({ error });
    }
    finally {
        console.log("Goodbye from new_user");
    }
}));
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
    console.log(`Example app listening on port ${port}`);
});
