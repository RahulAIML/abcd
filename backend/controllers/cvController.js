const db = require('../db');

const getAllCVs = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, keyprogramming, URLlinks FROM cvs'
    );
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
};

const getCVById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const [rows] = await db.execute(
      'SELECT id, name, email, keyprogramming, profile, education, URLlinks FROM cvs WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'CV not found' });
    }
    return res.json(rows[0]);
  } catch (err) {
    return next(err);
  }
};

const searchCVs = async (req, res, next) => {
  try {
    const name = (req.query.name || '').trim();
    const keyprogramming = (req.query.keyprogramming || '').trim();

    if (!name && !keyprogramming) {
      return res.status(400).json({ message: 'Search by name or keyprogramming' });
    }

    let sql = 'SELECT id, name, email, keyprogramming FROM cvs WHERE 1=1';
    const data = [];

    if (name) {
      sql += ' AND LOWER(name) LIKE LOWER(?)';
      data.push(`%${name}%`);
    }

    if (keyprogramming) {
      sql += ' AND LOWER(keyprogramming) LIKE LOWER(?)';
      data.push(`%${keyprogramming}%`);
    }

    const [rows] = await db.execute(sql, data);
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
};

const createCV = async (req, res, next) => {
  try {
    const name = (req.body.name || '').trim();
    const keyprogramming = (req.body.keyprogramming || '').trim();
    const education = (req.body.education || '').trim();
    const profile = (req.body.profile || '').trim();
    const URLlinks = (req.body.URLlinks || '').trim();
    const email = req.user.email;

    if (!name || !keyprogramming || !education || !profile || !URLlinks) {
      return res.status(400).json({ message: 'Please fill required fields' });
    }

    const [result] = await db.execute(
      'UPDATE cvs SET name = ?, keyprogramming = ?, profile = ?, education = ?, URLlinks = ? WHERE email = ?',
      [name, keyprogramming, profile, education, URLlinks, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    return res.json({ message: 'CV saved', email });
  } catch (err) {
    return next(err);
  }
};

const updateCV = async (req, res, next) => {
  try {
    const id = req.params.id;
    const name = (req.body.name || '').trim();
    const keyprogramming = (req.body.keyprogramming || '').trim();
    const education = (req.body.education || '').trim();
    const profile = (req.body.profile || '').trim();
    const URLlinks = (req.body.URLlinks || '').trim();
    const email = req.user.email;

    if (!name || !keyprogramming || !education || !profile || !URLlinks) {
      return res.status(400).json({ message: 'Please fill required fields' });
    }

    const [existing] = await db.execute('SELECT id, email FROM cvs WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'CV not found' });
    }
    if (existing[0].email !== email) {
      return res.status(403).json({ message: 'Not allowed to update this CV' });
    }

    await db.execute(
      'UPDATE cvs SET name = ?, keyprogramming = ?, profile = ?, education = ?, URLlinks = ? WHERE id = ?',
      [name, keyprogramming, profile, education, URLlinks, id]
    );

    return res.json({ message: 'Updated', id });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllCVs,
  getCVById,
  searchCVs,
  createCV,
  updateCV
};
