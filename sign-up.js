const express = require('express');
const mysql = require('mysql2/promise'); // Use mysql2 package
const bodyParser = require('body-parser');
const PORT = 3000;
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sign-up.html')); // Make sure the file exists
});

app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, contactNumber, password, confirmPassword } = req.body;
  console.log('req.body:', req.body);

  if (password !== confirmPassword) {
    res.status(400).send({ message: 'Passwords do not match' });
    return;
  }

  const query = `INSERT INTO users (first_name, last_name, email, contact_number, password) VALUES (?, ?, ?, ?, ?)`;
  const values = [firstName, lastName, email, contactNumber, password];

  try {
    const [results] = await pool.execute(query, values);
    console.log('Query results:', results);
    if (results.affectedRows === 1) {
      res.send({ message: 'User created successfully' });
    } else {
      res.status(500).send({ message: 'Error creating user' });
    }
  } catch (err) {
    console.error('Error inserting into database:', err);
    res.status(500).send({ message: 'Error creating user' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});