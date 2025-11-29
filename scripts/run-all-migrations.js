const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'elnovel2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true // Enable multiple statements for migration
};

async function runMigration() {
  const migrationsDir = path.join(__dirname, '../db/migrations');
  
  try {
    const pool = mysql.createPool(dbConfig);
    
    // Read all sql files from db/migrations
    const files = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql')).sort();
    
    console.log(`Found ${files.length} migration files in ${migrationsDir}`);
    
    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const migrationFile = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationFile, 'utf8');
      
      try {
        await pool.query(sql);
        console.log(`✓ ${file} completed successfully`);
      } catch (err) {
        console.error(`✗ Failed to run ${file}:`, err.message);
        // Continue with other migrations or throw depending on requirement
        // throw err; 
      }
    }

    console.log('All migrations processed.');
    await pool.end();
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  }
}

runMigration();
