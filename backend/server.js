const express = require('express')

// Express options
const app = express()
const port = 3000;

// Allows body parsing
app.use(express.urlencoded({extended: false}));

// Allows cookies to be understood by the server
const cookieParser = require('cookie-parser')

// lets you use the cookieParser in your application
app.use(cookieParser());

// crypo module
const crypto = require ("crypto");

const algorithm = "aes-256-cbc";

// generate 16 bytes of random data
const initVector = crypto.randomBytes(16);

// secret key generate 32 bytes of random data
const Securitykey = crypto.randomBytes(32);

// the cipher function
const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);

// encrypt the message
// input encoding
// output encoding
// let encryptedData = cipher.update(message, "utf-8", "hex");

// Encrypts data given, such as Oauth_token and Oauth_secret
// Returns web-friendly utf-8 encoded encrypted data
function encrypt(data) {


    // Create Cipher based on file constants
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(Securitykey), initVector);

    // encrypt the data into the cipher
    let encrypted = cipher.update(data);
    // call cipher.final() to close the cipher
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    // return the utf-8 encoded encryption
    return encrypted.toString('hex'); 
}

// Decrypts data given, assumes data is in utf-8
// Returns a decrypted string containing data
function decrypt(encryptedData) {

    let encryptedText = Buffer.from(encryptedData, 'hex');

    // let decodedData = Buffer.from(encryptedData, 'base64', 'hex');
    // Create a Decipher
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(Securitykey), initVector);

    // Give it our encrypted Text
    let decrypted = decipher.update(encryptedText);

    // Call decipher.final() to close it
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // return decrypted string
    return decrypted.toString('utf-8');
}


// Interceptors can intercept axios requests and execute things
const axios = require('axios').default;
axios.interceptors.request.use(config => {
    // log a message before any HTTP request is sent
    console.log('Request was sent');
  
    return config;
  });

// Discogs API information
const DISCOGS_API_KEY = 'QmMqPrQDitHQDZpPdyIB';
const DISCOGS_API_SECRET = 'TrPSisogDAvEqrzXlpizykozdMkWWBWO';
const DISCOGS_OAUTH_REQUEST_TOKEN_URL = 'https://api.discogs.com/oauth/request_token';
const DISCOGS_OAUTH_AUTHENTICATE_TOKEN_URL = 'https://discogs.com/oauth/authorize?oauth_token='
const callback_url = "";

const AUTH_URL = 'https://api.discogs.com/oauth/access_token';



// Set up the public assets
app.use(express.static('public'))
app.set('views', './views')
app.set('view engine', 'pug');


// custom middleware to select the desired router based on custom header
app.use((req, res, next) => {

    // Various Logging for request and req headers
    // console.log(req);
    // console.log(req.get("Oauth"));
    const header_value = req.get("Oauth");
    //console.log(req.headers);

    // Allows the interepted request to continue
    next();

    // Logic for changing route on headers
    // if (appName === "web"
    //) {
    //     webRoute(req, res, next);
    // } else if (appName === "cms") {
    //     cmsRoute(req, res, next);
    // } else {
    //     next();
    // }
});

// Get OAuth Token from api.discogs.com
// Returns encrypted oauth object
// { oauth_token, oauth_token_secret }
async function getOauthToken(api_key, api_secret, oauth_url, callback_url) {
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
    oauth_token = encrypt(oauth_token);

    oauth_token_secret = oauth_token_secret.split('=')[1];
    oauth_token_secret = encrypt(oauth_token_secret);

    // Return now encrypted tokens, decrypt as necessary
    return {oauth_token, oauth_token_secret}
}

// POST the now-verified token
async function postVerificationToken(api_key, api_secret, oauth_token, oauth_secret, oauth_verifier) {
    // console.log({oauth_verifier});
    const request = {
        method: 'POST',
        url: AUTH_URL,
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

    console.log("Sent Verification awaiting response");
    return response;
}

// Test how to create an authorized request on getting a 200 response from 
// GET https://api.discogs.com/oauth/identity
// oauth 
async function createAuthorizedRequest(api_key, api_secret, oauth_token, oauth_secret, oauth_verifier) {
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
                `oauth_verifier=\"${oauth_verifier}\"`
        },
    }
    console.log({request});
    const response = await axios(request);

    console.log("Sent Authorized(?) request.");
    return response;
}

app.get('/', async (req, res) => {
    const cookies = req.cookies;
    console.log(cookies);
    console.log(cookies.oauth_token);
    if (cookies.oauth_token) {
        res.render('/identity', {});
    }

    // if (req.cookie.oauth_token === undefined) {
    //     res.redirect('/new_user');
    // }
 
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
        if (req.cookies.oauth_token) {
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

    if (!req.body.token) {
        return;
    } else {
        // console.log({ verifier: req.body.token});
    }

    try {
        const {data, status, statusText} = await postVerificationToken(
            DISCOGS_API_KEY,
            DISCOGS_API_SECRET,
            decrypt(req.cookies.oauth_token),
            decrypt(req.cookies.oauth_token_secret),
            req.body.token);
        // data is the axios styled response
        console.log({data, status, statusText});
        if (status === 200) {
            console.log("Success! User authorized")
            res.redirect('/identity');
        }
    }
    catch (error) {
        // console.log(error);
    }
    finally {
        console.log("Goodbye from /auth POST");
    }
});

// Show Collection
app.get('/identity', async (req, res) => {
    try {
        const {data, status, statusText} = await createAuthorizedRequest(
            DISCOGS_API_KEY,
            DISCOGS_API_SECRET,
            decrypt(req.cookies.oauth_token),
            decrypt(req.cookies.oauth_token_secret),
            req.body.token);
            console.log({data, status, statusText});
            res.render('identity', {});
    }
    catch (error) {
        console.log(error);
    }
    finally {
        console.log("Goodbye from /identity GET");
    }
});

// Give a new user an oauth_token and secret cookie
app.get('/new_user', async (req, res) => {
    try {
        // Get oauth_token { oauth_token, oauth_secret }
        const oauth = await getOauthToken(DISCOGS_API_KEY, DISCOGS_API_SECRET, DISCOGS_OAUTH_REQUEST_TOKEN_URL, callback_url);
        // Add the token to the authentication url
        const oauthUrl = DISCOGS_OAUTH_AUTHENTICATE_TOKEN_URL + decrypt(oauth.oauth_token);
        
        // Set the encrypted oauth_token and encrypted oauth_token_secret cookies
        res.cookie('oauth_token', oauth.oauth_token);
        res.cookie('oauth_token_secret', oauth.oauth_token_secret);

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
        // clear cookie
        res.clearCookie('oauth_token');
        res.clearCookie('oauth_token_secret');
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
 