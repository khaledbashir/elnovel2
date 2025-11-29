import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./db/schema";

const dbUrl = new URL(process.env.DATABASE_URL);

export const pool = mysql.createPool({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port),
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.substring(1),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: dbUrl.protocol === "https:" || dbUrl.searchParams.get("ssl") === "true",
});

export const db = drizzle(pool, { schema, mode: "default" });

