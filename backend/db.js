const mysql = require('mysql2');
const fs = require('fs');

// Load a secret file if present (Render mounts files in /etc/secrets)
function loadSecretFile() {
  const candidates = [
    process.env.SECRET_FILE,
    process.env.RENDER_SECRET_FILE,
    '/etc/secrets/.env',
    '/etc/secrets/db.env',
    '/etc/secrets/database.env',
    '/etc/secrets/secret.env',
    '/etc/secrets/AstonCv.env'
  ].filter(Boolean);

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach((line) => {
      const clean = line.trim();
      if (!clean || clean.startsWith('#')) return;
      const idx = clean.indexOf('=');
      if (idx === -1) return;
      const key = clean.slice(0, idx).trim();
      let value = clean.slice(idx + 1).trim();
      value = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
    break;
  }
}

loadSecretFile();

// connection using DATABASE_URL or individual env vars
let baseConfig;
const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;
const usingDatabaseUrl = !!databaseUrl;

if (usingDatabaseUrl) {
  baseConfig = { uri: databaseUrl };

  // Railway MySQL proxy usually requires SSL
  if (databaseUrl.includes('proxy.rlwy.net')) {
    baseConfig.ssl = { rejectUnauthorized: false };
  }
} else {
  baseConfig = {
    host: process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST || '127.0.0.1',
    user: process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.MYSQL_USERNAME || 'your_db_user',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || 'your_db_password',
    database: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'your_db_name',
    port: process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306
  };

  if (String(baseConfig.host).includes('proxy.rlwy.net')) {
    baseConfig.ssl = { rejectUnauthorized: false };
  }
}

console.log('DB config info:', {
  usingDatabaseUrl,
  host: usingDatabaseUrl ? 'DATABASE_URL' : baseConfig.host,
  port: usingDatabaseUrl ? 'default' : baseConfig.port,
  user: usingDatabaseUrl ? 'DATABASE_URL' : (baseConfig.user && '***')
});

const pool = mysql.createPool({
  ...baseConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error('DB error connecting');
    console.error(err);
  } else {
    console.log('DB connected');
    conn.release();
  }
});

module.exports = pool;

