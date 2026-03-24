const mysql = require('mysql2');

// basic connection (env variables)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.log('DB error');
    console.log(err);
  } else {
    console.log('DB connected');
  }
});

module.exports = db;

