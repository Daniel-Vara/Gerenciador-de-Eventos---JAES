/**
 * DATABASE CONNECTION POOL
 * 
 * Sets up a connection pool to the MySQL database using `mysql2/promise`.
 * Connection pooling is highly recommended for production Node.js applications
 * because it manages multiple connections dynamically, improving performance and
 * resource reuse compared to establishing a new connection on every request.
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'jaes',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Helper function to test DB connection and log status
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Connection established successfully with pool to host: ${process.env.DB_HOST || '127.0.0.1'}`);
    connection.release();
  } catch (error) {
    console.error('[Database Error] Failed to connect to MySQL server:', error.message);
    console.warn('[Database Setup] Make sure local MySQL is running and credentials in .env are correct.');
  }
}

testConnection();

module.exports = pool;
