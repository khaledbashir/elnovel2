const mysql = require('mysql2/promise');
// require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'ahmad_elnovel22', 
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'elnovel22',
    password: process.env.DB_PASSWORD || 'elonvel22',
    database: process.env.DB_NAME || 'elnovel22',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        try {
            await connection.execute(`ALTER TABLE workspaces ADD COLUMN description TEXT`);
            console.log('Added description column to workspaces');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('Column description already exists');
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

migrate();
