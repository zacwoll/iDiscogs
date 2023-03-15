// Load environment variables from a .env file with `dotenv`
import * as dotenv from 'dotenv';
dotenv.config();
import * as crypto from 'crypto';
// Define the encryption algorithm to use
const algorithm = 'aes-256-cbc';
// Load the encryption key and initialization vector from environment variables
const key = Buffer.from(process.env.SECURITY_KEY, 'hex');
const iv = Buffer.from(process.env.SECURITY_IV, 'hex');
/**
 * Encrypts the given data using AES-256-CBC encryption.
 *
 * @param data The data to encrypt.
 * @returns An object containing the encrypted data in web-friendly UTF-8 format.
 */
export function encrypt(data) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { data: encrypted.toString('hex') };
}
/**
 * Decrypts the given encrypted data using AES-256-CBC encryption.
 *
 * @param encryptedData The encrypted data to decrypt.
 * @returns The decrypted data as a string.
 */
export function decrypt(encryptedData) {
    const encryptedText = Buffer.from(encryptedData, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf-8');
}
