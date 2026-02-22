const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;

// Neon DB connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // set this in Render
  ssl: { rejectUnauthorized: false }
});

app.use(bodyParser.json());
app.use(express.static('public'));

// ----- REGISTER -----
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) return res.json({ success:false, message:'Username and password required' });

  try {
    const exists = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
    if(exists.rows.length > 0) return res.json({ success:false, message:'Username already taken' });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1,$2)', [username, hashed]);
    res.json({ success:true, message:'Registration successful! You can login now.' });
  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:'Server error' });
  }
});

// ----- LOGIN -----
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
    if (result.rows.length === 0) return res.json({ success: false, message: 'Invalid username' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: 'Invalid password' });

    res.json({ success: true, message: 'Login successful!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ----- GET PRODUCTS -----
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ----- PLACE ORDER -----
app.post('/order', async (req, res) => {
  const { product_id, customer_name, address, email } = req.body;
  try {
    await pool.query(
      'INSERT INTO orders (product_id, customer_name, address, email) VALUES ($1,$2,$3,$4)',
      [product_id, customer_name, address, email]
    );
    res.json({ success: true, message: 'Order placed!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
