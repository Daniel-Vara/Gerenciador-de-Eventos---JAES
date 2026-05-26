/**
 * DATABASE MIGRATION SCRIPT
 * 
 * Safely updates the `events` table `event_status` enum from:
 * ('active', 'completed', 'canceled') -> ('EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')
 * It maps existing data safely to avoid SQL warnings or truncation.
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
  console.log('[Migration] Starting event status enum migration...');
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'senai103',
      database: process.env.DB_NAME || 'jaes'
    });

    console.log('[Migration] Successfully connected to database.');

    // 1. Temporarily modify column to VARCHAR to allow storing any string value
    console.log('[Migration] Step 1: Converting event_status to VARCHAR temporarily...');
    await connection.query('ALTER TABLE events MODIFY COLUMN event_status VARCHAR(50) DEFAULT \'EM_ANDAMENTO\'');

    // 2. Map old string values to the new ones
    console.log('[Migration] Step 2: Mapping old status values to the new Portuguese enums...');
    const [resultActive] = await connection.query('UPDATE events SET event_status = \'EM_ANDAMENTO\' WHERE event_status = \'active\' OR event_status IS NULL');
    const [resultCompleted] = await connection.query('UPDATE events SET event_status = \'CONCLUIDO\' WHERE event_status = \'completed\'');
    const [resultCanceled] = await connection.query('UPDATE events SET event_status = \'CANCELADO\' WHERE event_status = \'canceled\'');
    
    console.log(`[Migration] Mapped active->EM_ANDAMENTO (${resultActive.affectedRows} rows), completed->CONCLUIDO (${resultCompleted.affectedRows} rows), canceled->CANCELADO (${resultCanceled.affectedRows} rows)`);

    // 3. Re-convert column to the final ENUM type
    console.log('[Migration] Step 3: Changing column type to final ENUM type...');
    await connection.query('ALTER TABLE events MODIFY COLUMN event_status ENUM(\'EM_ANDAMENTO\', \'CONCLUIDO\', \'CANCELADO\') DEFAULT \'EM_ANDAMENTO\'');

    console.log('[Migration] Database schema migrated successfully!');

  } catch (error) {
    console.error('[Migration Error] Failed to migrate database schema:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
