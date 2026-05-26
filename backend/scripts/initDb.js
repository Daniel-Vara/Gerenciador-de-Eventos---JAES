/**
 * DATABASE INITIALIZATION SCRIPT
 * 
 * This script is automatically executed on server startup.
 * It connects to local MySQL, creates the database if it doesn't exist,
 * creates all necessary relational tables, and inserts seed data.
 * 
 * By doing this, we guarantee that the presentation starts immediately
 * without requiring the instructor to manually import SQL files!
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'jaes';

async function initializeDatabase() {
  console.log('[DB Init] Starting database auto-setup...');
  let connection;

  try {
    // 1. First, connect without specifying the database to create it if it doesn't exist
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword
    });

    console.log(`[DB Init] Connected to MySQL server at ${dbHost}:${dbPort}`);

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`[DB Init] Database "${dbName}" verified/created successfully.`);
    await connection.end();

    // 2. Connect directly to the newly created/existing database
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      multipleStatements: true // Allow execution of multiple statements at once
    });

    // 3. Read the schema.sql file
    const schemaPath = path.join(__dirname, '../sql/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at path: ${schemaPath}`);
    }

    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    
    // 4. Run the schema queries
    console.log('[DB Init] Executing schema DDL and seeding mock data...');
    await connection.query(sqlContent);
    console.log('[DB Init] Relational tables created and seed data populated successfully.');

    // 5. Query stats for validation printout
    const [events] = await connection.query('SELECT COUNT(*) AS count FROM events');
    const [participants] = await connection.query('SELECT COUNT(*) AS count FROM participants');
    console.log(`[DB Init] Verification check: Found ${events[0].count} events and ${participants[0].count} participants in the database.`);

  } catch (error) {
    console.error('\n========================================================================');
    console.error('[DB Init Error] Database initialization failed!');
    console.error(`Error Details: ${error.message}`);
    console.error('------------------------------------------------------------------------');
    console.error('POSSIBLE SOLUTIONS:');
    console.error('1. Make sure your local MySQL server (XAMPP, WampServer, or native MySQL) is RUNNING.');
    console.error('2. Verify the username and password in your backend/`/.env` file match your MySQL setup.');
    console.error('3. Check if MySQL is running on a different port than 3306 and update DB_PORT in .env.');
    console.error('========================================================================\n');
  } finally {
    if (connection && connection.connection && connection.connection.stream && !connection.connection.stream.destroyed) {
      await connection.end();
    }
  }
}

// Support running directly from command line
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
