"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare = exports.toHash = void 0;
const crypto_1 = require("crypto");
const util_1 = require("util");
const scryptAsync = util_1.promisify(crypto_1.scrypt);
async function toHash(password) {
    const salt = crypto_1.randomBytes(16).toString('hex');
    const buf = (await scryptAsync(password, salt, 64));
    return `${buf.toString('hex')}.${salt}`;
}
exports.toHash = toHash;
async function compare(storedPassword, suppliedPassword) {
    const [hashedPassword, salt] = storedPassword.split('.');
    const buf = (await scryptAsync(suppliedPassword, salt, 64));
    return buf.toString('hex') === hashedPassword;
}
exports.compare = compare;
//# sourceMappingURL=Crypt.js.map