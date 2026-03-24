const db = require('../db');
const bcrypt = require('bcrypt');

const register = (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim();
  const password = (req.body.password || '').trim();

  if (!name || !email || !password) {
    return res.json({ message: 'Name, email and password required' });
  }

  // check existing
  db.query('SELECT id FROM cvs WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.log(err);
      return res.send('error');
    }

    if (result.length > 0) {
      return res.json({ message: 'Email already exists' });
    }

    // hash password
    bcrypt.hash(password, 10, (err2, hash) => {
      if (err2) {
        console.log(err2);
        return res.send('error');
      }

      // insert data
      const sql = 'INSERT INTO cvs (name, email, password) VALUES (?, ?, ?)';
      db.query(sql, [name, email, hash], (err3, result2) => {
        if (err3) {
          console.log(err3);
          return res.send('error');
        }
        console.log('User registered:', email);
        res.json({ message: 'Registered', user: { id: result2.insertId, email: email } });
      });
    });
  });
};

const login = (req, res) => {
  const email = (req.body.email || '').trim();
  const password = (req.body.password || '').trim();

  if (!email || !password) {
    return res.json({ message: 'Email and password required' });
  }

  db.query('SELECT * FROM cvs WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.log(err);
      return res.send('error');
    }

    if (result.length === 0) {
      return res.json({ message: 'Invalid login' });
    }

    const user = result[0];

    // check login
    bcrypt.compare(password, user.password, (err2, same) => {
      if (err2) {
        console.log(err2);
        return res.send('error');
      }

      if (!same) {
        return res.json({ message: 'Invalid login' });
      }

      console.log('User login:', email);
      res.json({ message: 'Login success', user: { id: user.id, email: user.email } });
    });
  });
};

module.exports = {
  register,
  login
};
