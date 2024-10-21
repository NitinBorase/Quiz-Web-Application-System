const express = require('express');
const mysql = require('mysql2/promise'); // Use mysql2 package
const bodyParser = require('body-parser');
const PORT = 3001;
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Nitin@123',
  database: 'quizlife',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  authPlugin: 'mysql_native_password' // Specify the authentication plugin
});

// Test the database connection
pool.getConnection()
  .then(connection => {
    console.log('Connected to database');
    connection.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('Error connecting to database:', err);
  });

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('req.body:', req.body);

  // Validate email and password
  if (!email || !password) {
    res.status(400).send({ message: 'Email and password are required' });
    return;
  }

  // Query the database to check if the user exists
  const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
  const values = [email, password];

  try {
    const [results] = await pool.execute(query, values);
    if (results.length === 1) {
      // User exists, log them in
      //res.send({ message: 'Logged in successfully' });
      res.redirect('/quiz.html');
    } else {
      res.status(401).send({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).send({ message: 'Error logging in' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});