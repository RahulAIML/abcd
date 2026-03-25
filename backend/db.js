const mysql = require('mysql2');

// connection using DATABASE_URL or individual env vars
let config;
if (process.env.DATABASE_URL) {
  config = process.env.DATABASE_URL;

  // Railway MySQL usually requires SSL through the proxy host
  if (process.env.DATABASE_URL.includes('proxy.rlwy.net')) {
    config = {
      uri: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: true }
    };
  }
} else {
  config = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'your_db_user',
    password: process.env.DB_PASS || 'your_db_password',
    database: process.env.DB_NAME || 'your_db_name',
    port: process.env.DB_PORT || 3306
  };
}

console.log('DB config info:', {
  usingDatabaseUrl: !!process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? 'DATABASE_URL' : config.host,
  port: process.env.DATABASE_URL ? 'default' : config.port,
  user: process.env.DATABASE_URL ? 'DATABASE_URL' : (config.user && '***')
});

const db = mysql.createConnection(config);

db.connect((err) => {
  if (err) {
    console.error('DB error connecting');
    console.error(err);
    console.error('Resolved connection config:', config);
  } else {
    console.log('DB connected');
  }
});

module.exports = db;

