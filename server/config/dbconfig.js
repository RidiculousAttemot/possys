// config/dbConfig.js

const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create the MySQL connection using environment variables
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',       // Defaults to localhost
  user: process.env.DB_USER || 'root',            // Defaults to root
  password: process.env.DB_PASSWORD || '',        // Defaults to empty password
  database: process.env.DB_NAME || 'morpos'       // Defaults to morpos
});

// Connect to the MySQL database
connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL database:', err.message);
    process.exit(1); // Exit if connection fails
  }
  console.log(`✅ Connected to MySQL Database: ${process.env.DB_NAME || 'morpos'}`);
});

module.exports = connection;
