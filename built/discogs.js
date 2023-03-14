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
exports.search = exports.generateQueryUrl = exports.configureHeaders = exports.configureRequest = exports.getIdentity = exports.postVerificationToken = exports.getOauthToken = void 0;
require('dotenv').config();
// imports
var axios = require('axios').default;
var crypto = require("./crypto");
// Discogs API information
// API AND API SECRET will come in through a .env file
var DISCOGS_API_KEY = process.env.DISCOGS_API_KEY;
var DISCOGS_API_SECRET = process.env.DISCOGS_API_SECRET;
var DISCOGS_OAUTH_POST_URL = 'https://api.discogs.com/oauth/access_token';
var callback_url = process.env.callback_url;
// Get OAuth Token from api.discogs.com
// Requests and retrieves an initial 'request' Oauth Token from Discogs API
// Returns encrypted oauth object
// { oauth_token, oauth_token_secret }
function getOauthToken(oauth_url) {
    return __awaiter(this, void 0, void 0, function () {
        var response, _a, oauth_token, oauth_token_secret;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, axios.get(oauth_url, {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Authorization": "OAuth oauth_consumer_key=\"".concat(DISCOGS_API_KEY, "\",") +
                                "oauth_nonce=\"".concat(Date.now(), "\",") +
                                "oauth_signature=\"".concat(DISCOGS_API_SECRET, "&\",") +
                                "oauth_signature_method=\"PLAINTEXT\"," +
                                "oauth_timestamp=\"".concat(Date.now(), "\",") +
                                "oauth_callback=\"".concat(callback_url, "\"")
                        },
                    })];
                case 1:
                    response = _b.sent();
                    _a = response.data.split('&'), oauth_token = _a[0], oauth_token_secret = _a[1];
                    oauth_token = oauth_token.split('=')[1];
                    oauth_token = crypto.encrypt(oauth_token).data;
                    oauth_token_secret = oauth_token_secret.split('=')[1];
                    oauth_token_secret = crypto.encrypt(oauth_token_secret).data;
                    // Return now encrypted tokens, decrypt as necessary
                    return [2 /*return*/, { oauth_token: oauth_token, oauth_token_secret: oauth_token_secret }];
            }
        });
    });
}
exports.getOauthToken = getOauthToken;
// POST the now-verified token
// This function posts a complete set of access request keys to discogs API
function postVerificationToken(oauth_token, oauth_secret, oauth_verifier) {
    return __awaiter(this, void 0, void 0, function () {
        var request, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = {
                        method: 'POST',
                        url: DISCOGS_OAUTH_POST_URL,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Authorization": '' +
                                "OAuth oauth_consumer_key=\"".concat(DISCOGS_API_KEY, "\",") +
                                "oauth_nonce=\"".concat(Date.now(), "\",") +
                                "oauth_token=\"".concat(oauth_token, "\",") +
                                "oauth_signature=\"".concat(DISCOGS_API_SECRET, "&").concat(oauth_secret, "\",") +
                                "oauth_signature_method=\"PLAINTEXT\"," +
                                "oauth_timestamp=\"".concat(Date.now(), "\",") +
                                "oauth_verifier=\"".concat(oauth_verifier, "\"")
                        },
                    };
                    console.log({ request: request });
                    return [4 /*yield*/, axios(request)];
                case 1:
                    response = _a.sent();
                    console.log("Authorizing User");
                    return [2 /*return*/, response];
            }
        });
    });
}
exports.postVerificationToken = postVerificationToken;
// Test how to create an authorized request on getting a 200 response from 
// GET https://api.discogs.com/oauth/identity
// oauth 
function getIdentity(request_config) {
    return __awaiter(this, void 0, void 0, function () {
        var IDENTITY_URL, request, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    IDENTITY_URL = 'https://api.discogs.com/oauth/identity';
                    request = configureRequest('GET', IDENTITY_URL, request_config);
                    return [4 /*yield*/, axios(request)];
                case 1:
                    response = _a.sent();
                    console.log('Sent Request for Identity');
                    return [2 /*return*/, response];
            }
        });
    });
}
exports.getIdentity = getIdentity;
/*
    configure an authorized request for discogs, before putting data in it
    This is a function intended to make easier requests from discogs
    THis is a premade request with the right headers the first time, not configuring them on the fly
*/
function configureRequest(method, url, config) {
    var request = {
        method: method,
        url: url,
    };
    request.headers = configureHeaders(config.oauth_token, config.oauth_secret);
    return request;
}
exports.configureRequest = configureRequest;
/*
    Configure the headers for an authorized request
*/
function configureHeaders(oauth_token, oauth_secret) {
    var headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": '' +
            "OAuth oauth_consumer_key=\"".concat(DISCOGS_API_KEY, "\",") +
            "oauth_nonce=\"".concat(Date.now(), "\",") +
            "oauth_token=\"".concat(oauth_token, "\",") +
            "oauth_signature=\"".concat(DISCOGS_API_SECRET, "&").concat(oauth_secret, "\",") +
            "oauth_signature_method=\"PLAINTEXT\"," +
            "oauth_timestamp=\"".concat(Date.now(), "\",") +
            "oauth_callback=\"".concat(callback_url, "\"")
    };
    return headers;
}
exports.configureHeaders = configureHeaders;
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
function generateQueryUrl(prefix, query) {
    var url = prefix;
    for (var _i = 0, _a = Object.entries(query); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (value !== '') {
            url += "&".concat(key, "=").concat(value);
        }
    }
    console.log(url);
    return url;
}
exports.generateQueryUrl = generateQueryUrl;
// Oauth_token & Oauth_token_secret
function search(request_config, query) {
    return __awaiter(this, void 0, void 0, function () {
        var SEARCH_URL, url, request, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    SEARCH_URL = 'https://api.discogs.com/database/search?';
                    url = generateQueryUrl(SEARCH_URL, query);
                    request = configureRequest('GET', url, request_config);
                    console.log(request);
                    return [4 /*yield*/, axios(request)];
                case 1:
                    response = _a.sent();
                    console.log("Sent Authorized request.");
                    return [2 /*return*/, response];
            }
        });
    });
}
exports.search = search;
