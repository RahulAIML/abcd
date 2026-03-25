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
  console.log('=== CREATE CV REQUEST ===');
  console.log('Raw req.body:', req.body);
  
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim();
  const keyprogramming = (req.body.keyprogramming || '').trim();
  const education = (req.body.education || '').trim();
  const profile = (req.body.profile || '').trim();
  const URLlinks = (req.body.URLlinks || '').trim();

  console.log('Parsed fields:', {name, email, keyprogramming, education, profile, URLlinks});

  // Validation like registration does
  if (!name || !email || !keyprogramming) {
    console.log('Validation failed: missing required fields');
    return res.json({ message: 'Please fill required fields' });
  }

  // Find user by email (must exist from registration)
  db.query('SELECT id FROM cvs WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.error('SELECT error:', err);
      return res.send('error');
    }

    console.log('Query result:', result.length > 0 ? 'User found' : 'User not found');

    if (result.length === 0) {
      console.log('User does not exist - must register first');
      return res.json({ message: 'User not found. Please register first.' });
    }

    const userId = result[0].id;
    
    // UPDATE user's CV fields (like registration just inserts)
    const sql = 'UPDATE cvs SET name = ?, keyprogramming = ?, profile = ?, education = ?, URLlinks = ? WHERE id = ?';
    const values = [name, keyprogramming, profile || null, education || null, URLlinks || null, userId];
    
    console.log('Executing UPDATE with query:', sql);
    console.log('With values:', values);
    
    db.query(sql, values, (err2, result2) => {
      if (err2) {
        console.error('UPDATE error:', err2);
        return res.send('error');
      }
      console.log('UPDATE affectedRows:', result2.affectedRows, 'changedRows:', result2.changedRows);
      console.log('CV created/updated:', userId, {name, keyprogramming, profile, education, URLlinks});
      res.json({ message: 'CV created', id: userId });
    });
  });
};

const updateCV = (req, res) => {
  const id = req.params.id;
  console.log('=== UPDATE CV REQUEST ===');
  console.log('Raw req.body:', req.body);
  console.log('CV ID:', id);
  
  const name = (req.body.name || '').trim();
  const keyprogramming = (req.body.keyprogramming || '').trim();
  const education = (req.body.education || '').trim();
  const profile = (req.body.profile || '').trim();
  const URLlinks = (req.body.URLlinks || '').trim();
  const email = (req.body.email || '').trim();

  console.log('Parsed fields:', {name, keyprogramming, education, profile, URLlinks, email});

  // Validation like registration
  if (!name || !keyprogramming) {
    console.log('Validation failed: name and keyprogramming required');
    return res.json({ message: 'Name and keyprogramming are required' });
  }

  if (!email) {
    console.log('Validation failed: email required for verification');
    return res.json({ message: 'Email required for verification' });
  }

  // Check ownership by email like registration checked email
  db.query('SELECT id, email FROM cvs WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('SELECT error:', err);
      return res.send('error');
    }

    if (result.length === 0) {
      console.log('CV not found for id:', id);
      return res.json({ message: 'CV not found' });
    }

    // Verify owner
    if (result[0].email !== email) {
      console.log('Email mismatch - ownership check failed. Record email:', result[0].email, 'Provided:', email);
      return res.json({ message: 'Not allowed - ownership verification failed' });
    }

    // UPDATE like registration just sets values
    const sql = 'UPDATE cvs SET name = ?, keyprogramming = ?, profile = ?, education = ?, URLlinks = ? WHERE id = ?';
    const values = [name, keyprogramming, profile || null, education || null, URLlinks || null, id];
    
    console.log('Executing UPDATE with query:', sql);
    console.log('With values:', values);
    
    db.query(sql, values, (err2, result2) => {
      if (err2) {
        console.error('UPDATE error:', err2);
        return res.send('error');
      }
      console.log('UPDATE affectedRows:', result2.affectedRows, 'changedRows:', result2.changedRows);
      console.log('CV updated:', id, {name, keyprogramming, profile, education, URLlinks});
      res.json({ message: 'Updated', id });
    });
  });
};

module.exports = {
  getAllCVs,
  getCVById,
  searchCVs,
  createCV,
  updateCV
};
