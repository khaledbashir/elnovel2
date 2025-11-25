import fs from 'fs';
import path from 'path';
import { query } from '../lib/database.js';

async function runMigration() {
  const migrationFile = path.join(__dirname, '../migrations/001_create_initial_tables.sql');
  
  try {
    const sql = fs.readFileSync(migrationFile, 'utf8');
    console.log('Running migration...');
    
    // Split the SQL file into individual statements
    const statements = sql
      .split(';')
      .filter(statement => statement.trim() && !statement.trim().startsWith('--'));

    for (const statement of statements) {
      await query(statement);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();