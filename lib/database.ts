import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'novelsql',
  password: process.env.DB_PASSWORD || 'novelsql',
  database: process.env.DB_NAME || 'novelsql',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to execute queries
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to execute queries that return a single row
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  try {
    const [rows] = await pool.execute(sql, params);
    const rowArray = rows as any[];
    return rowArray.length > 0 ? (rowArray[0] as T) : null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}


// Test the connection
export async function testConnection() {
  try {
    const rows = await query('SELECT 1 as test');
    console.log('Database connected successfully:', rows);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export default pool;