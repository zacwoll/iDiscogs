const express = require('express')

// import * as discogs from './discogs';
// import * as my_crypto from './crypto';
// import * as google from './google';
// import { send } from 'process';

// Express options
const app = express()
const port = 3000;

// Allows body parsing
app.use(express.urlencoded({limit: '50mb', extended: false}));

// Allows cookies to be understood by the server
const cookieParser = require('cookie-parser')

// lets you use the cookieParser in your application
app.use(cookieParser());

const path = require('path');

// Set up the public assets
// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.set('views', path.join(__dirname, '../frontend/views'));
app.set('view engine', 'pug');


// Pug Tester
app.get('/', async (req, res) => {
    res.render('includes/discogsSearchForm', {});
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
 

  