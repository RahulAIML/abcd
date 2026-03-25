const mysql = require('mysql2');

// connection using DATABASE_URL or individual env vars
let baseConfig;
const usingDatabaseUrl = !!process.env.DATABASE_URL;

if (usingDatabaseUrl) {
  baseConfig = { uri: process.env.DATABASE_URL };

  // Railway MySQL proxy usually requires SSL
  if (process.env.DATABASE_URL.includes('proxy.rlwy.net')) {
    baseConfig.ssl = { rejectUnauthorized: false };
  }
} else {
  baseConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'your_db_user',
    password: process.env.DB_PASS || 'your_db_password',
    database: process.env.DB_NAME || 'your_db_name',
    port: process.env.DB_PORT || 3306
  };
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

