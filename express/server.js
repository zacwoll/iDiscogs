const express = require('express')

// Express options
const app = express()
const port = 3000;

// Allows cookies to be understood by the server
const cookieParser = require('cookie-parser')

// lets you use the cookieParser in your application
app.use(cookieParser());

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

const auth_url = 'https://api.discogs.com/oauth/access_token';



// Set up the public assets
app.use(express.static('public'))
app.set('views', './views')
app.set('view engine', 'pug');


// custom middleware to select the desired router based on custom header
app.use((req, res, next) => {
    // console.log(req);
    // console.log(req.get("Oauth"));
    const header_value = req.get("Oauth");
    //console.log(req.headers);
    next();
    // if (appName === "web") {
    //     webRoute(req, res, next);
    // } else if (appName === "cms") {
    //     cmsRoute(req, res, next);
    // } else {
    //     next();
    // }
});

// Make a request for a user with a given ID
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
    oauth_token_secret = oauth_token_secret.split('='[1]);
    // // handle success
    // console.log(`oauth_token  =  ${oauth_token}`);
    // console.log(`oauth_token_secret  =  ${oauth_token_secret}`);
    return {oauth_token, oauth_token_secret}
}

async function postVerificationToken(api_key, api_secret, oauth_key, oauth_secret, oauth_verifier, auth_url) {
    const response = await axios({
        method: 'POST',
        url: auth_url,
        headers: {
            "Content-Type" : "application/x-www-form-urlencoded",
            "Authorization" : '' +
                `OAuth oauth_consumer_key=\"${DISCOGS_CONSUMER_KEY}\",` +
                `oauth_nonce=\"${Date.now()}\",` +
                `oauth_token=\"${oauth_token}\",` +
                `oauth_signature=\"${DISCOGS_CONSUMER_SECRET}&${oauth_secret}\",` +
                `oauth_signature_method=\"PLAINTEXT\",` +
                `oauth_timestamp=\"${Date.now()}\",` +
                `oauth_verifier=\"${oauth_verifier}\"`
        },
    });
    console.log("Posted");
    return response;
    //   .then(function (response) {
    //     // handle success
    //     console.log(response.status, response._headers);  
    //   })    
}


// respond with "hello world" when a GET request is made to the homepage
// app.get('/', (req, res) => {
//   res.send('hello world')
// })


app.get('/', async (req, res) => {
    try {
        // Set oauth token cookie

        const oauth = await getOauthToken(DISCOGS_API_KEY, DISCOGS_API_SECRET, DISCOGS_OAUTH_REQUEST_TOKEN_URL, callback_url);
        const oauthUrl = DISCOGS_OAUTH_AUTHENTICATE_TOKEN_URL + oauth.oauth_token;
        
        // res.cookie(key, value);
        res.cookie(`Cookie`, `My awesome cookie!`);
        res.cookie(`oauth_token`, oauth.oauth_token);
        res.cookie(`oauth_token_secret`, oauth.oauth_token_secret);

        res.render('index', { oauthUrl });
    } catch (error) {
        console.log({error})
    } finally {
        console.log("Goodbye")
    }
  })

// the /auth page will send up the verfication code entering page
// Open up verification code entrance
// Use the code to set a cookie on the page
// watch on this page for the cookie's value to change
// fire the post request with the cookie's verifier

// TODO encrypt cookies
// TODO post to own endpoint
app.get('/auth', async (req, res) => {
    try {
        console.log(req.headers);

    } catch (error) {
        console.log({error});
    } finally {
        console.log("Goodbye");
    }
});

// the /auth page will POST the verification
app.post('/auth', async (req, res) => {
    // const response = await postVerificationToken(DISCOGS_API_KEY, DISCOGS_API_SECRET, DIS)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })