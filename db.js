// ============================================================================
// db.js - Universal Database Layer (MySQL + Pure JS Cloud Fallback)
// ============================================================================
// 1. Tries MySQL if DATABASE_URL or local MySQL service is reachable.
// 2. Automatically falls back to pure JavaScript database for Render 24/7 cloud
//    hosting (zero native addons, zero glibc issues, 100% compatible).
// ============================================================================

require('dotenv').config();
const path = require('path');
const fs = require('fs');

let mysqlPool = null;
let isPureDb = false;
let pureDbInstance = null;

// Initialize MySQL pool
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

// Dynamic Provider Selector
async function getProvider() {
  if (isPureDb) {
    if (!pureDbInstance) pureDbInstance = require('./pure-db');
    return pureDbInstance;
  }

  if (mysqlPool) {
    try {
      const conn = await mysqlPool.getConnection();
      conn.release();
      return mysqlPool;
    } catch (err) {
      console.log('ℹ️ MySQL not reachable (' + err.message + ').');
      console.log('🚀 Using pure JavaScript database engine for Render 24/7 cloud hosting!');
      isPureDb = true;
      pureDbInstance = require('./pure-db');
      return pureDbInstance;
    }
  }

  isPureDb = true;
  pureDbInstance = require('./pure-db');
  return pureDbInstance;
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

getProvider().then(provider => {
  if (provider === mysqlPool) {
    console.log(' Connected to MySQL database:', process.env.DB_NAME || 'campushub');
  } else {
    console.log(' Connected to Pure JS database (Render Cloud 24/7 Ready)');
  }
}).catch(() => {});

module.exports = pool;
