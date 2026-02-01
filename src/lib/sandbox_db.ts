import fs from 'fs';
import path from 'path';
import { pool } from './db';
import 'server-only';

function dbNameFromSandbox(sandboxId: string) {
  return 'sandbox_' + sandboxId.replace(/-/g, '').slice(0, 50);
}

export async function ensureSandboxDb(sandboxId: string) {
  const dbName = dbNameFromSandbox(sandboxId);
  const conn = await pool.getConnection();

  try {
    // Check if database exists
    const [rows] = await conn.query('SHOW DATABASES LIKE ?', [dbName]);


    if ((rows as any[]).length === 0) {
      console.log(`Creating database: ${dbName}`);
      
      // Create database
      await conn.query(`CREATE DATABASE \`${dbName}\``);
      
      // Switch to the database using changeUser
      //await conn.changeUser({ database: dbName });
      await conn.query(`USE \`${dbName}\``);
      console.log(`Switched to database: ${dbName}`);

      // Find init.sql file
      let initSqlPath = path.join(process.cwd(), 'src', 'lib', 'sql', 'init.sql');
      if (!fs.existsSync(initSqlPath)) {
        throw new Error(`init.sql not found`);
      }

      console.log(`Reading SQL from: ${initSqlPath}`);
      const initSql = fs.readFileSync(initSqlPath, 'utf8');
      console.log(`Executing SQL initialization...`);
      await conn.query(initSql);
      
      // Verify tables were created
      const [tables] = await conn.query('SHOW TABLES');
      console.log(`Tables created:`, tables);
      console.log(`Database ${dbName} initialized successfully`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    conn.release();
  }

  return dbName;
}