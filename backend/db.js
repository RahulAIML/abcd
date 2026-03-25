const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load local .env if present (for dev)
dotenv.config({ path: path.join(__dirname, '..', '..', 'AstonCV.env') });
dotenv.config(); // also load default .env if present

const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

// Optional: Render secret file support
const renderSecretPath = '/etc/secrets/AstonCv.env';
if (requiredVars.some((k) => !process.env[k]) && fs.existsSync(renderSecretPath)) {
  const content = fs.readFileSync(renderSecretPath, 'utf8');
  content.split('\n').forEach((line) => {
    const clean = line.trim();
    if (!clean || clean.startsWith('#')) return;
    const idx = clean.indexOf('=');
    if (idx === -1) return;
    const key = clean.slice(0, idx).trim();
    let value = clean.slice(idx + 1).trim();
    value = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    if (requiredVars.includes(key) && !process.env[key]) {
      process.env[key] = value;
    }
  });
}

const missing = requiredVars.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error('Missing DB environment variables:', missing.join(', '));
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('proxy.rlwy.net')
    ? { rejectUnauthorized: false }
    : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('DB connected');
  } catch (err) {
    console.error('DB connection error');
    console.error(err);
  }
}

testConnection();

module.exports = pool;

