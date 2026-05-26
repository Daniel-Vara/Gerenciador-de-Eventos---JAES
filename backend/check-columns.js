const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function check() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'senai103',
      database: process.env.DB_NAME || 'jaes'
    });

    const [columns] = await connection.query('DESCRIBE events');
    console.log('Columns in events table:', columns);
  } catch (err) {
    console.error('Error checking columns:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

check();
