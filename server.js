// server.js
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// تكوين اتصال Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// جلب جميع القضايا
app.get('/api/cases', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cases');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// إضافة قضية جديدة
app.post('/api/cases', async (req, res) => {
  const { id, client_name, type, court, judge, status, registration_date, update_date, favorite, description } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO cases (id, client_name, type, court, judge, status, registration_date, update_date, favorite, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [id, client_name, type, court, judge, status, registration_date, update_date, favorite, description]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// تحديث حالة المفضلة
app.patch('/api/cases/:id/favorite', async (req, res) => {
  const { id } = req.params;
  const { favorite } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE cases SET favorite = $1 WHERE id = $2 RETURNING *',
      [favorite, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
