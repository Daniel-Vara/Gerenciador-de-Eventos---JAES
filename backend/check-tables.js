const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

async function check() {
  console.log('Checking database tables...');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'senai103',
      database: process.env.DB_NAME || 'jaes'
    });

    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables found in database:', tables);

    if (tables.length > 0) {
      const [events] = await connection.query('SELECT * FROM events');
      console.log('Events in table:', events);
    }
  } catch (err) {
    console.error('Error checking database:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

check();
