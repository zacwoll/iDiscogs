require('dotenv').config()

// crypto module
const crypto = require ("crypto");

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.SECURITY_KEY, 'hex');
const iv = Buffer.from(process.env.SECURITY_IV, 'hex');

// encrypt the message
// input encoding
// output encoding
// let encryptedData = cipher.update(message, "utf-8", "hex");

// Encrypts data given, such as Oauth_token and Oauth_secret
// Returns web-friendly utf-8 encoded encrypted data object
export function encrypt(data) {
    // let bsiv = crypto.randomBytes(16).toString('hex');
    // Create Cipher based on file constants
    let cipher = crypto.createCipheriv(algorithm, key, iv);

    // encrypt the data into the cipher
    let encrypted = cipher.update(data);
    // call cipher.final() to close the cipher
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { data: encrypted.toString('hex') }
}

// Decrypts data given, assumes data is in utf-8
// Returns a decrypted string containing data
export function decrypt(encryptedData) {

    let encryptedText = Buffer.from(encryptedData, 'hex');

    // let decodedData = Buffer.from(encryptedData, 'base64', 'hex');
    // Create a Decipher
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);

    // Give it our encrypted Text
    let decrypted = decipher.update(encryptedText);

    // Call decipher.final() to close it
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // return decrypted string
    return decrypted.toString('utf-8');
}
