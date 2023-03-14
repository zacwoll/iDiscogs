"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
dotenv.config();
var express = require('express');
var discogs = require("./discogs");
var crypto = require("./crypto");
var google = require("./google");
// Express options
var app = express();
var port = 3000;
// Allows body parsing
app.use(express.urlencoded({ limit: '50mb', extended: false }));
// Allows cookies to be understood by the server
var cookieParser = require('cookie-parser');
// lets you use the cookieParser in your application
app.use(cookieParser());
var path = require('path');
var axios = require('axios').default;
// Discogs API information
var DISCOGS_OAUTH_REQUEST_TOKEN_URL = 'https://api.discogs.com/oauth/request_token';
var DISCOGS_OAUTH_AUTHENTICATE_TOKEN_URL = 'https://discogs.com/oauth/authorize?oauth_token=';
var AUTH_URL = 'https://api.discogs.com/oauth/access_token';
// Set up the public assets
// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'frontend/public')));
app.set('views', path.join(__dirname, '/frontend/views'));
app.set('view engine', 'pug');
app.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cookies, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cookies = req.cookies;
                if (!cookies.request_token) return [3 /*break*/, 1];
                res.redirect('/auth');
                return [3 /*break*/, 4];
            case 1:
                if (!cookies.oauth_token) return [3 /*break*/, 3];
                return [4 /*yield*/, discogs.getIdentity({
                        oauth_token: crypto.decrypt(req.cookies.oauth_token),
                        oauth_token_secret: crypto.decrypt(req.cookies.oauth_token_secret)
                    })];
            case 2:
                data = (_a.sent()).data;
                res.render('identity', { username: data.username });
                return [3 /*break*/, 4];
            case 3:
                res.redirect('/new_user');
                _a.label = 4;
            case 4:
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
                return [2 /*return*/];
        }
    });
}); });
app.post('/requestAnnotation', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fileData, annotation, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fileData = req.body.data.substring(23);
                if (!req.body) {
                    console.log('missing Data');
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, 4, 5]);
                return [4 /*yield*/, google.getAnnotation(fileData)];
            case 2:
                annotation = _a.sent();
                // console.log(JSON.stringify(annotation, null, 2));
                res.send({ annotation: annotation });
                return [3 /*break*/, 5];
            case 3:
                error_1 = _a.sent();
                console.log(error_1);
                return [3 /*break*/, 5];
            case 4:
                console.log("Goodbye from /upload POST");
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.post('/search', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, request_config, _a, data, status_1, statusCode, pagination, results, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log('Hello from /search');
                query = req.body.query;
                query = JSON.parse(query);
                if (!req.body) {
                    console.log('missing Data');
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, 4, 5]);
                request_config = {
                    oauth_token: crypto.decrypt(req.cookies.oauth_token),
                    oauth_secret: crypto.decrypt(req.cookies.oauth_token_secret),
                };
                return [4 /*yield*/, discogs.search(request_config, query)];
            case 2:
                _a = _b.sent(), data = _a.data, status_1 = _a.status, statusCode = _a.statusCode;
                pagination = data.pagination;
                results = data.results;
                // console.log(data);
                console.log(JSON.stringify(data.results, null, 2));
                res.send(results);
                return [3 /*break*/, 5];
            case 3:
                error_2 = _b.sent();
                console.log(error_2);
                return [3 /*break*/, 5];
            case 4:
                console.log("Goodbye from /upload POST");
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); });
// the /auth page will send up the verfication code entering page auth.pug
// fire the post request with the cookie's verifier
app.get('/auth', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            if (req.cookies.request_token) {
                res.render('auth', {});
            }
            else {
                res.render('401', {});
            }
        }
        catch (error) {
            console.log({ error: error });
        }
        finally {
            console.log("Goodbye from /auth GET");
        }
        return [2 /*return*/];
    });
}); });
// the /auth page will POST the verification
app.post('/auth', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var request_token, request_token_secret, request_token_verifier, _a, data, status_2, statusText, _b, oauth_token, oauth_token_secret, error_3;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                // This is intended to come from the /auth page, which creates this token in this manner
                if (!req.body.token) {
                    console.log('request has no verification token in the body');
                    return [2 /*return*/];
                }
                request_token = crypto.decrypt(req.cookies.request_token);
                request_token_secret = crypto.decrypt(req.cookies.request_token_secret);
                request_token_verifier = req.body.token;
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, 4, 5]);
                return [4 /*yield*/, discogs.postVerificationToken(request_token, request_token_secret, request_token_verifier)];
            case 2:
                _a = _c.sent(), data = _a.data, status_2 = _a.status, statusText = _a.statusText;
                // data is the axios styled response
                console.log({ data: data, status: status_2, statusText: statusText });
                _b = data.split('&'), oauth_token = _b[0], oauth_token_secret = _b[1];
                oauth_token = oauth_token.split('=')[1];
                oauth_token_secret = oauth_token_secret.split('=')[1];
                oauth_token = crypto.encrypt(oauth_token).data;
                res.cookie('oauth_token', oauth_token);
                oauth_token_secret = crypto.encrypt(oauth_token_secret).data;
                res.cookie('oauth_token_secret', oauth_token_secret);
                if (status_2 === 200) {
                    console.log("Success! User authorized");
                    // Clear the request token
                    res.clearCookie('request_token');
                    res.clearCookie('request_token_secret');
                    // redirect to identity
                    res.redirect('/identity');
                }
                return [3 /*break*/, 5];
            case 3:
                error_3 = _c.sent();
                console.log(error_3);
                return [3 /*break*/, 5];
            case 4:
                console.log("Goodbye from /auth POST");
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Show Identity
app.get('/identity', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cookies, request_config, _a, data, status_3, statusText, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("GET /identity started");
                cookies = req.cookies;
                if (!cookies.oauth_token || !cookies.oauth_token_secret) {
                    if (!cookies.request_token) {
                        res.redirect('/new_user');
                    }
                    else {
                        res.redirect('/auth');
                    }
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, 4, 5]);
                request_config = {
                    oauth_token: crypto.decrypt(req.cookies.oauth_token),
                    oauth_secret: crypto.decrypt(req.cookies.oauth_token_secret),
                };
                return [4 /*yield*/, discogs.getIdentity(request_config)];
            case 2:
                _a = _b.sent(), data = _a.data, status_3 = _a.status, statusText = _a.statusText;
                console.log({ data: data, status: status_3, statusText: statusText });
                res.cookie('username', data.username);
                res.render('identity', { username: data.username });
                return [3 /*break*/, 5];
            case 3:
                error_4 = _b.sent();
                console.log(error_4);
                return [3 /*break*/, 5];
            case 4:
                console.log("Goodbye from /identity GET");
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Give a new user a request oauth_token and secret cookie
app.get('/new_user', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var oauth, oauthUrl, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, 3, 4]);
                return [4 /*yield*/, discogs.getOauthToken(DISCOGS_OAUTH_REQUEST_TOKEN_URL)];
            case 1:
                oauth = _a.sent();
                oauthUrl = DISCOGS_OAUTH_AUTHENTICATE_TOKEN_URL + crypto.decrypt(oauth.oauth_token, oauth.oauth_token_iv);
                // THis is a request oauth token, they send me a new one later
                // Set the encrypted oauth_token and encrypted oauth_token_secret cookies
                res.cookie('request_token', oauth.oauth_token);
                res.cookie('request_token_secret', oauth.oauth_token_secret);
                // Render index with the personal oauth_url link on the page
                res.render('new_user', { oauthUrl: oauthUrl });
                return [3 /*break*/, 4];
            case 2:
                error_5 = _a.sent();
                console.log({ error: error_5 });
                return [3 /*break*/, 4];
            case 3:
                console.log("Goodbye from new_user");
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/clearCookies', function (req, res) {
    try {
        var cookies = req.cookies;
        for (var cookie in cookies) {
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
app.listen(port, function () {
    console.log("Example app listening on port ".concat(port));
});
