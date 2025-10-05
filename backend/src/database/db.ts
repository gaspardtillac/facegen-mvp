import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

class Database {
  private db: sqlite3.Database;

  constructor() {
    const dbPath = path.join(__dirname, 'app.db');
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  private async init() {
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  async findUserByEmail(email: string) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async createUser(email: string, passwordHash: string) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT INTO users (email, password, credits) VALUES (?, ?, 10)', 
        [email, passwordHash], function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, email, credits: 10 });
        });
    });
  }

  async updateUserCredits(userId: number, creditsToAdd: number) {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE users SET credits = credits + ? WHERE id = ?', 
        [creditsToAdd, userId], (err) => {
          if (err) reject(err);
          else resolve(true);
        });
    });
  }

  async getUserCredits(userId: number) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT credits FROM users WHERE id = ?', [userId], (err, row: any) => {
        if (err) reject(err);
        else resolve(row?.credits || 0);
      });
    });
  }

  async createTransaction(userId: number, sessionId: string, packageType: string, credits: number, amount: number) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO transactions (user_id, stripe_session_id, package_type, credits_purchased, amount_paid) VALUES (?, ?, ?, ?, ?)',
        [userId, sessionId, packageType, credits, amount],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async updateTransactionStatus(sessionId: string, status: string) {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE transactions SET status = ? WHERE stripe_session_id = ?', 
        [status, sessionId], (err) => {
          if (err) reject(err);
          else resolve(true);
        });
    });
  }

  async getTransactionBySessionId(sessionId: string) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM transactions WHERE stripe_session_id = ?', [sessionId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

export const database = new Database();
