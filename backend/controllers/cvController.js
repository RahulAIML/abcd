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

  if (!name || !email || !keyprogramming) {
    console.log('Validation failed: missing required fields');
    return res.json({ message: 'Please fill required fields' });
  }

  // if row exists, update it instead of insert
  db.query('SELECT id, email FROM cvs WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.error('SELECT error:', err);
      return res.send('error');
    }

    console.log('Found existing record:', result.length > 0 ? result[0] : 'none');

    if (result.length > 0) {
      const row = result[0];
      
      // Build dynamic UPDATE only with non-empty fields
      const updates = [];
      const updateValues = [];

      if (name) { updates.push('name = ?'); updateValues.push(name); }
      if (keyprogramming) { updates.push('keyprogramming = ?'); updateValues.push(keyprogramming); }
      if (profile) { updates.push('profile = ?'); updateValues.push(profile); }
      if (education) { updates.push('education = ?'); updateValues.push(education); }
      if (URLlinks) { updates.push('URLlinks = ?'); updateValues.push(URLlinks); }

      if (updates.length === 0) {
        console.log('No CV fields provided to create/update');
        return res.json({ message: 'Please fill at least one CV field' });
      }

      updateValues.push(row.id);
      const sql = 'UPDATE cvs SET ' + updates.join(', ') + ' WHERE id = ?';
      
      console.log('Executing UPDATE (existing row) with query:', sql);
      console.log('With values:', updateValues);
      
      db.query(sql, updateValues, (err2, result2) => {
        if (err2) {
          console.error('CV update (create) failed:', err2);
          return res.send('error');
        }
        console.log('UPDATE affectedRows:', result2.affectedRows, 'changedRows:', result2.changedRows);
        console.log('CV updated (create):', row.id, {name, keyprogramming, profile, education, URLlinks});
        return res.json({ message: 'CV updated', id: row.id });
      });
      return;
    }

    const sql = 'INSERT INTO cvs (name, email, password, keyprogramming, profile, education, URLlinks) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const insertValues = [
      name, 
      email, 
      '', 
      keyprogramming,
      profile || null,  // Convert empty string to NULL for optional fields
      education || null,
      URLlinks || null
    ];
    
    console.log('Executing INSERT with query:', sql);
    console.log('With values:', insertValues);
    
    db.query(sql, insertValues, (err3, result2) => {
      if (err3) {
        console.error('INSERT query error:', err3);
        return res.send('error');
      }
      console.log('INSERT affectedRows:', result2.affectedRows, 'insertId:', result2.insertId);
      console.log('CV created:', result2.insertId, {name, email, keyprogramming, profile, education, URLlinks});
      res.json({ message: 'CV created', id: result2.insertId });
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

  // Build dynamic UPDATE only with non-empty fields
  const updates = [];
  const values = [];

  if (name) { updates.push('name = ?'); values.push(name); }
  if (keyprogramming) { updates.push('keyprogramming = ?'); values.push(keyprogramming); }
  if (education) { updates.push('education = ?'); values.push(education); }
  if (profile) { updates.push('profile = ?'); values.push(profile); }
  if (URLlinks) { updates.push('URLlinks = ?'); values.push(URLlinks); }

  if (updates.length === 0) {
    console.log('Validation failed: no fields to update');
    return res.json({ message: 'Please fill at least one field to update' });
  }

  if (!email) {
    console.log('Validation failed: no email provided');
    return res.json({ message: 'Not allowed' });
  }

  // check owner by email
  db.query('SELECT email FROM cvs WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('SELECT owner check error:', err);
      return res.send('error');
    }
    if (result.length === 0) {
      console.log('No record found for id:', id);
      return res.json({ message: 'Not found' });
    }
    console.log('Current owner email:', result[0].email, 'Provided email:', email);
    
    if (result[0].email !== email) {
      console.log('Email mismatch - ownership check failed');
      return res.json({ message: 'Not allowed' });
    }

    // Dynamic SQL: UPDATE cvs SET name = ?, keyprogramming = ? WHERE id = ?
    const sql = 'UPDATE cvs SET ' + updates.join(', ') + ' WHERE id = ?';
    values.push(id);
    
    console.log('Executing UPDATE query:', sql);
    console.log('With values:', values);
    
    db.query(sql, values, (err2, result2) => {
      if (err2) {
        console.error('UPDATE query error:', err2);
        return res.send('error');
      }
      console.log('UPDATE result affectedRows:', result2.affectedRows);
      console.log('CV updated:', id, {name, keyprogramming, education, profile, URLlinks});
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
