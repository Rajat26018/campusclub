// ============================================================================
// db.js - Universal Database Layer (MySQL + Automatic SQLite Cloud Fallback)
// ============================================================================
// 1. Tries MySQL if DATABASE_URL or local MySQL service is available.
// 2. Automatically falls back to embedded SQLite for 24/7 Render cloud hosting
//    so that the app runs anywhere without needing an external database setup.
// ============================================================================

require('dotenv').config();
const path = require('path');
const fs = require('fs');

let isSqlite = false;
let sqliteInstance = null;
let mysqlPool = null;

// ----------------------------------------------------------------------------
// 1. SQLite Database Provider (Embedded & Zero-Config for Render Cloud)
// ----------------------------------------------------------------------------
function getSqlitePool() {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, 'campushub.sqlite');
  const db = new sqlite3.Database(dbPath);

  const initPromise = new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS clubs (
        club_id INTEGER PRIMARY KEY AUTOINCREMENT,
        club_name TEXT NOT NULL UNIQUE,
        category TEXT,
        description TEXT,
        faculty_coordinator TEXT,
        founded_year INTEGER
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS members (
        member_id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        usn TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        phone TEXT,
        course TEXT,
        semester INTEGER
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS memberships (
        membership_id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER NOT NULL,
        club_id INTEGER NOT NULL,
        role TEXT DEFAULT 'Member',
        joined_on TEXT,
        UNIQUE(member_id, club_id),
        FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
        FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS events (
        event_id INTEGER PRIMARY KEY AUTOINCREMENT,
        club_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        event_date TEXT,
        venue TEXT,
        FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS registrations (
        registration_id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        member_id INTEGER NOT NULL,
        registered_on TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, member_id),
        FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
      )`);

      db.get('SELECT COUNT(*) AS count FROM clubs', (err, row) => {
        if (!err && row && row.count === 0) {
          console.log('🌱 Seeding initial campus clubs and events into SQLite...');
          const clubs = [
            [1, 'Coding Club', 'Technical', 'Weekly coding practice and hackathons', 'Dr. Ramesh', 2018],
            [2, 'Cultural Club', 'Cultural', 'Dance, music and fest events', 'Mrs. Anitha', 2015],
            [3, 'Sports Club', 'Sports', 'Inter-college tournaments and fitness', 'Mr. Kumar', 2012],
            [4, 'Gravity SJCE', 'Cultural', '', 'Divya sharma of EC department', 2026],
            [5, 'chess club', 'Sports', '[icon:♟️]', 'Pavan kumar', 2025]
          ];
          const stmtC = db.prepare('INSERT OR IGNORE INTO clubs VALUES (?, ?, ?, ?, ?, ?)');
          clubs.forEach(c => stmtC.run(c));
          stmtC.finalize();

          const members = [
            [1, 'Rajat', '01JST25PCA005', 'rajat@example.com', '9876543210', 'BCA', 5],
            [2, 'Ananya S', '01JST25PCA010', 'ananya@example.com', '9876500001', 'BCA', 5],
            [3, 'Kiran M', '01JST25PCA021', 'kiran@example.com', '9876500002', 'BCA', 3],
            [4, 'Vaibhavi', '1RVCS321', 'vaibhavishetti82@gmail.com', '9901980002', 'cse', 6],
            [5, 'Rahul sharma', '01JST25PCA011', 'rahul@gmail.com', '4201980002', 'MCA', 2],
            [6, 'Sunil kumar', '01JST25PCA234', 'sunil@gmail.com', '4201980002', 'CsE', 4]
          ];
          const stmtM = db.prepare('INSERT OR IGNORE INTO members VALUES (?, ?, ?, ?, ?, ?, ?)');
          members.forEach(m => stmtM.run(m));
          stmtM.finalize();

          const memberships = [
            [1, 1, 1, 'President', '2025-07-31 18:30:00'],
            [2, 2, 1, 'Member', '2025-08-04 18:30:00'],
            [3, 2, 2, 'Secretary', '2025-08-09 18:30:00'],
            [4, 3, 3, 'Member', '2025-08-31 18:30:00'],
            [5, 4, 2, 'President', '2026-11-02 18:30:00'],
            [6, 3, 4, 'Media & PR Lead', '2026-09-02 18:30:00'],
            [7, 1, 5, 'Vice President', '2026-11-03 18:30:00'],
            [8, 5, 2, 'Member', '2026-09-08 18:30:00']
          ];
          const stmtMs = db.prepare('INSERT OR IGNORE INTO memberships VALUES (?, ?, ?, ?, ?)');
          memberships.forEach(ms => stmtMs.run(ms));
          stmtMs.finalize();

          const events = [
            [1, 1, 'Hackathon 2026', '24-hour coding contest', '2026-12-09 18:30:00', 'Seminar Hall'],
            [2, 2, 'Annual Fest', 'Cultural programs', '2026-12-19 18:30:00', 'Main Auditorium'],
            [3, 3, 'Cricket Tournament', 'Inter-department matches', '2026-12-04 18:30:00', 'College Ground'],
            [4, 1, 'hack ai thon', 'hackthon for students', '2026-11-29 18:30:00', 'A block'],
            [5, 4, 'Solo Dance event', 'Show your steps and talent , get a chance to shine on stage', '2026-12-03 18:30:00', 'golden jubilee'],
            [6, 5, 'chess evenet', '', '2025-11-04 18:30:00', 'block c']
          ];
          const stmtE = db.prepare('INSERT OR IGNORE INTO events VALUES (?, ?, ?, ?, ?, ?)');
          events.forEach(e => stmtE.run(e));
          stmtE.finalize();

          const registrations = [
            [1, 1, 1, '2026-11-03 13:37:06'],
            [2, 1, 2, '2026-11-03 13:37:06'],
            [3, 2, 2, '2026-11-03 13:37:06'],
            [4, 3, 3, '2026-11-03 13:37:06']
          ];
          const stmtR = db.prepare('INSERT OR IGNORE INTO registrations VALUES (?, ?, ?, ?)');
          registrations.forEach(r => stmtR.run(r));
          stmtR.finalize((e) => {
            if (e) reject(e);
            else {
              console.log('✅ SQLite cloud database ready with all campus records!');
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    });
  });

  const queryFn = async (sql, params = []) => {
    await initPromise;
    return new Promise((resolve, reject) => {
      const trimmed = sql.trim();
      if (trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('PRAGMA')) {
        db.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve([rows, []]);
        });
      } else {
        db.run(sql, params, function(err) {
          if (err) return reject(err);
          resolve([{
            insertId: this.lastID,
            affectedRows: this.changes
          }, []]);
        });
      }
    });
  };

  return {
    query: queryFn,
    getConnection: async () => ({
      query: queryFn,
      beginTransaction: async () => queryFn('BEGIN TRANSACTION'),
      commit: async () => queryFn('COMMIT'),
      rollback: async () => queryFn('ROLLBACK'),
      release: () => {}
    })
  };
}

// ----------------------------------------------------------------------------
// 2. MySQL Provider Setup
// ----------------------------------------------------------------------------
try {
  const mysql = require('mysql2/promise');
  let config;
  if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
    const url = process.env.DATABASE_URL || process.env.MYSQL_URL;
    config = {
      uri: url,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 4000,
      ssl: (process.env.DB_SSL === 'true' || url.includes('ssl') || process.env.NODE_ENV === 'production')
        ? { rejectUnauthorized: false }
        : undefined
    };
  } else {
    config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'root',
      database: process.env.DB_NAME || 'campushub',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 3000
    };
  }
  mysqlPool = mysql.createPool(config);
} catch (err) {
  console.warn('⚠️ MySQL module init skipped:', err.message);
}

// ----------------------------------------------------------------------------
// 3. Dynamic Fallback Router
// ----------------------------------------------------------------------------
async function getProvider() {
  if (isSqlite) {
    if (!sqliteInstance) sqliteInstance = getSqlitePool();
    return sqliteInstance;
  }

  if (mysqlPool) {
    try {
      const conn = await mysqlPool.getConnection();
      conn.release();
      return mysqlPool;
    } catch (err) {
      console.log('ℹ️ MySQL not reachable (' + err.message + ').');
      console.log('🚀 Using embedded SQLite database for Render 24/7 cloud hosting!');
      isSqlite = true;
      sqliteInstance = getSqlitePool();
      return sqliteInstance;
    }
  }

  isSqlite = true;
  sqliteInstance = getSqlitePool();
  return sqliteInstance;
}

const pool = {
  query: async (sql, params) => {
    const provider = await getProvider();
    return provider.query(sql, params);
  },
  getConnection: async () => {
    const provider = await getProvider();
    return provider.getConnection();
  }
};

// Initial test check on startup
getProvider().then(provider => {
  if (provider === mysqlPool) {
    console.log(' Connected to MySQL database:', process.env.DB_NAME || 'campushub');
  } else {
    console.log(' Connected to SQLite database (Render Cloud Ready)');
  }
}).catch(() => {});

module.exports = pool;
