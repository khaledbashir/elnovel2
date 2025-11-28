import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
  };

  try {
    const connection = await mysql.createConnection(config);
    await connection.end();
    return NextResponse.json({ 
      status: 'success', 
      message: 'Connected successfully!', 
      config: { ...config, password: '***' } 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message, 
      code: error.code,
      config: { ...config, password: '***' } 
    }, { status: 500 });
  }
}
