// crypto module
const crypto = require ("crypto");
const path = require('path');

const algorithm = "aes-256-cbc";

// generate 16 bytes of random data
const initVector = crypto.randomBytes(16);

// TODO Turn the secret into an environment variable
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
export function encrypt(data) {

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
export function decrypt(encryptedData) {

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
