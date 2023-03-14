"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
require('dotenv').config();
// crypto module
var crypto = require("crypto");
var algorithm = "aes-256-cbc";
var key = Buffer.from(process.env.SECURITY_KEY, 'hex');
var iv = Buffer.from(process.env.SECURITY_IV, 'hex');
// encrypt the message
// input encoding
// output encoding
// let encryptedData = cipher.update(message, "utf-8", "hex");
// Encrypts data given, such as Oauth_token and Oauth_secret
// Returns web-friendly utf-8 encoded encrypted data object
function encrypt(data) {
    // let bsiv = crypto.randomBytes(16).toString('hex');
    // Create Cipher based on file constants
    var cipher = crypto.createCipheriv(algorithm, key, iv);
    // encrypt the data into the cipher
    var encrypted = cipher.update(data);
    // call cipher.final() to close the cipher
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { data: encrypted.toString('hex') };
}
exports.encrypt = encrypt;
// Decrypts data given, assumes data is in utf-8
// Returns a decrypted string containing data
function decrypt(encryptedData) {
    var encryptedText = Buffer.from(encryptedData, 'hex');
    // let decodedData = Buffer.from(encryptedData, 'base64', 'hex');
    // Create a Decipher
    var decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    // Give it our encrypted Text
    var decrypted = decipher.update(encryptedText);
    // Call decipher.final() to close it
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    // return decrypted string
    return decrypted.toString('utf-8');
}
exports.decrypt = decrypt;
