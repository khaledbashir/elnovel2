import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Create MySQL connection pool
const poolConnection = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "elnovel2",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Create Drizzle instance
export const db = drizzle(poolConnection);
