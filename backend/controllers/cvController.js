const db = require('../db');

const getAllCVs = (req, res) => {
  const sql = 'SELECT id, name, email, keyprogramming, URLlinks FROM cvs';
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.send('error');
    }
    res.json(result);
  });
};

const getCVById = (req, res) => {
  const id = req.params.id;
  console.log('=== GET CV BY ID ===');
  console.log('Fetching ID:', id);

  const sql = 'SELECT id, name, email, keyprogramming, profile, education, URLlinks FROM cvs WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('SELECT getCVById error:', err);
      return res.send('error');
    }
    console.log('Query result:', result);

    if (result.length === 0) {
      console.log('No record found for id:', id);
      return res.json({ message: 'Not found' });
    }
    console.log('Returning CV data:', result[0]);
    res.json(result[0]);
  });
};

const searchCVs = (req, res) => {
  const name = (req.query.name || '').trim();
  const keyprogramming = (req.query.keyprogramming || '').trim();

  if (!name && !keyprogramming) {
    return res.json({ message: 'Search name or keyprogramming' });
  }

  let sql = 'SELECT id, name, email, keyprogramming FROM cvs WHERE 1=1';
  const data = [];

  if (name) {
    sql += ' AND LOWER(name) LIKE LOWER(?)';
    data.push('%' + name + '%');
  }

  if (keyprogramming) {
    sql += ' AND LOWER(keyprogramming) LIKE LOWER(?)';
    data.push('%' + keyprogramming + '%');
  }

  db.query(sql, data, (err, result) => {
    if (err) {
      console.log(err);
      return res.send('error');
    }
    res.json(result);
  });
};

const createCV = (req, res) => {
  console.log('\n>>> CREATE CV HANDLER CALLED');
  console.log('req.body:', JSON.stringify(req.body, null, 2));
  console.log('req.body.name:', req.body.name, 'type:', typeof req.body.name);
  console.log('req.body.email:', req.body.email, 'type:', typeof req.body.email);
  console.log('req.body.keyprogramming:', req.body.keyprogramming, 'type:', typeof req.body.keyprogramming);
  console.log('req.body.profile:', req.body.profile, 'type:', typeof req.body.profile);
  console.log('req.body.education:', req.body.education, 'type:', typeof req.body.education);
  console.log('req.body.URLlinks:', req.body.URLlinks, 'type:', typeof req.body.URLlinks);

  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim();
  const keyprogramming = (req.body.keyprogramming || '').trim();
  const education = (req.body.education || '').trim();
  const profile = (req.body.profile || '').trim();
  const URLlinks = (req.body.URLlinks || '').trim();

  console.log('After trim - Parsed fields:', {
    name: `"${name}"`,
    email: `"${email}"`,
    keyprogramming: `"${keyprogramming}"`,
    education: `"${education}"`,
    profile: `"${profile}"`,
    URLlinks: `"${URLlinks}"`
  });

  if (!name || !email || !keyprogramming || !education || !profile || !URLlinks) {
    console.log('VALIDATION FAILED - missing required fields');
    console.log('name empty?', !name, 'email empty?', !email, 'keyprogramming empty?', !keyprogramming);
    console.log('education empty?', !education, 'profile empty?', !profile, 'URLlinks empty?', !URLlinks);
    return res.json({ message: 'Please fill required fields' });
  }

  console.log('Validation passed');

  // Update by email (email is unique)
  const sql = 'UPDATE cvs SET name = ?, keyprogramming = ?, profile = ?, education = ?, URLlinks = ? WHERE email = ?';
  const values = [name, keyprogramming, profile || null, education || null, URLlinks || null, email];

  console.log('Executing UPDATE query:', sql);
  console.log('With parameters:', values);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('UPDATE error:', err);
      return res.send('error');
    }
    console.log('UPDATE successful');
    console.log('Result:', result);
    console.log('Affected rows:', result.affectedRows);
    console.log('Changed rows:', result.changedRows);

    if (result.affectedRows === 0) {
      console.log('User not found for email:', email);
      return res.json({ message: 'User not found. Please register first.' });
    }

    res.json({ message: 'CV saved', email });
  });
};

const updateCV = (req, res) => {
  const id = req.params.id;
  console.log('\n>>> UPDATE CV HANDLER CALLED');
  console.log('URL Param id:', id);
  console.log('req.body:', JSON.stringify(req.body, null, 2));
  console.log('req.body.name:', req.body.name, 'type:', typeof req.body.name);
  console.log('req.body.keyprogramming:', req.body.keyprogramming, 'type:', typeof req.body.keyprogramming);
  console.log('req.body.email:', req.body.email, 'type:', typeof req.body.email);

  const name = (req.body.name || '').trim();
  const keyprogramming = (req.body.keyprogramming || '').trim();
  const education = (req.body.education || '').trim();
  const profile = (req.body.profile || '').trim();
  const URLlinks = (req.body.URLlinks || '').trim();
  const email = (req.body.email || '').trim();

  console.log('After trim - Parsed fields:', {
    name: `"${name}"`,
    keyprogramming: `"${keyprogramming}"`,
    email: `"${email}"`,
    education: `"${education}"`,
    profile: `"${profile}"`,
    URLlinks: `"${URLlinks}"`
  });

  if (!name || !keyprogramming || !education || !profile || !URLlinks) {
    console.log('VALIDATION FAILED - missing required fields');
    console.log('name empty?', !name, 'keyprogramming empty?', !keyprogramming);
    console.log('education empty?', !education, 'profile empty?', !profile, 'URLlinks empty?', !URLlinks);
    return res.json({ message: 'Please fill required fields' });
  }

  if (!email) {
    console.log('VALIDATION FAILED - email required for verification');
    return res.json({ message: 'Email required for verification' });
  }

  console.log('Validation passed');

  const sql = 'UPDATE cvs SET name = ?, keyprogramming = ?, profile = ?, education = ?, URLlinks = ? WHERE id = ? AND email = ?';
  const values = [name, keyprogramming, profile || null, education || null, URLlinks || null, id, email];

  console.log('Executing UPDATE query:', sql);
  console.log('With parameters:', values);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('UPDATE error:', err);
      return res.send('error');
    }
    console.log('UPDATE completed');
    console.log('Result:', result);
    console.log('Affected rows:', result.affectedRows);
    console.log('Changed rows:', result.changedRows);

    if (result.affectedRows === 0) {
      return res.json({ message: 'Not allowed or CV not found' });
    }

    res.json({ message: 'Updated', id });
  });
};

module.exports = {
  getAllCVs,
  getCVById,
  searchCVs,
  createCV,
  updateCV
};
