const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const cvRoutes = require('./routes/cvRoutes');

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// routes
app.use('/api', authRoutes);
app.use('/api', cvRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server started on port ' + PORT);
});
