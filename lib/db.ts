import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./db/schema";

// Helper to handle database connection
const createPool = () => {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL is not set");
      // Return a dummy pool or handle appropriately
      return null;
    }

    const dbUrl = new URL(process.env.DATABASE_URL);
    
    return mysql.createPool({
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port || "3306"),
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.substring(1),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: dbUrl.protocol === "https:" || dbUrl.searchParams.get("ssl") === "true" 
           ? { rejectUnauthorized: false } // Often needed for cloud DBs
           : undefined,
    });
  } catch (error) {
    console.error("Failed to create database pool:", error);
    return null;
  }
};

export const pool = createPool();

// Only create drizzle instance if pool exists
export const db = pool ? drizzle(pool, { schema, mode: "default" }) : null;

