const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = (req.body.password || '').trim();

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password required' });
    }

    const [existing] = await db.execute('SELECT id FROM cvs WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO cvs (name, email, password) VALUES (?, ?, ?)',
      [name, email, hash]
    );

    return res.status(201).json({
      message: 'Registered',
      user: { id: result.insertId, email, name }
    });
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = (req.body.password || '').trim();

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const [rows] = await db.execute('SELECT id, name, email, password FROM cvs WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid login' });
    }

    const user = rows[0];
    const same = await bcrypt.compare(password, user.password);
    if (!same) {
      return res.status(401).json({ message: 'Invalid login' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      secret,
      { expiresIn: '2h' }
    );

    return res.json({
      message: 'Login success',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { register, login };
