"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class Database {
    constructor() {
        const dbPath = path_1.default.join(__dirname, 'app.db');
        this.db = new sqlite3_1.default.Database(dbPath);
        this.init();
    }
    async init() {
        const sqlPath = path_1.default.join(__dirname, 'init.sql');
        const sql = fs_1.default.readFileSync(sqlPath, 'utf8');
        return new Promise((resolve, reject) => {
            this.db.exec(sql, (err) => {
                if (err)
                    reject(err);
                else
                    resolve(true);
            });
        });
    }
    async findUserByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }
    async createUser(email, passwordHash) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO users (email, password, credits) VALUES (?, ?, 10)', [email, passwordHash], function (err) {
                if (err)
                    reject(err);
                else
                    resolve({ id: this.lastID, email, credits: 10 });
            });
        });
    }
    async updateUserCredits(userId, creditsToAdd) {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE users SET credits = credits + ? WHERE id = ?', [creditsToAdd, userId], (err) => {
                if (err)
                    reject(err);
                else
                    resolve(true);
            });
        });
    }
    async getUserCredits(userId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT credits FROM users WHERE id = ?', [userId], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row?.credits || 0);
            });
        });
    }
    async createTransaction(userId, sessionId, packageType, credits, amount) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO transactions (user_id, stripe_session_id, package_type, credits_purchased, amount_paid) VALUES (?, ?, ?, ?, ?)', [userId, sessionId, packageType, credits, amount], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this.lastID);
            });
        });
    }
    async updateTransactionStatus(sessionId, status) {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE transactions SET status = ? WHERE stripe_session_id = ?', [status, sessionId], (err) => {
                if (err)
                    reject(err);
                else
                    resolve(true);
            });
        });
    }
    async getTransactionBySessionId(sessionId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM transactions WHERE stripe_session_id = ?', [sessionId], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }
}
exports.database = new Database();
