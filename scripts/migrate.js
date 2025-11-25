const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Database connection configuration
const dbConfig = {
  host: 'ahmad_sow-workbench-db',
  user: 'mysql',
  password: 'ef9b3440eef9a9829415',
  database: 'ahmad',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function runMigration() {
  const migrationFile = path.join(__dirname, '../migrations/001_create_initial_tables.sql');
  
  try {
    const sql = fs.readFileSync(migrationFile, 'utf8');
    console.log('Running migration...');
    
    const pool = mysql.createPool(dbConfig);
    
    // Split the SQL file into individual statements
    const statements = sql
      .split(';')
      .filter(statement => statement.trim() && !statement.trim().startsWith('--'));

    for (const statement of statements) {
      await pool.execute(statement);
    }

    console.log('Migration completed successfully!');
    await pool.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();