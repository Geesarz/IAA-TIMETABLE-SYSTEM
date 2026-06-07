import mysql from 'mysql2/promise';

/**
 * MySQL Database Connection Pool
 * Reusable connection pool for database operations
 */

let pool: mysql.Pool | null = null;

export async function getDbPool() {
  if (!pool) {
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'class_harmony';
    const port = parseInt(process.env.DB_PORT || '3306', 10);

    pool = await mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      connectionLimit: 10,
      waitForConnections: true,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0,
    });
  }
  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function query<T>(sql: string, values?: any[]): Promise<T[]> {
  const dbPool = await getDbPool();
  const [rows] = await dbPool.execute(sql, values);
  return rows as T[];
}

export async function execute(sql: string, values?: any[]) {
  const dbPool = await getDbPool();
  const result = await dbPool.execute(sql, values);
  return result;
}

export async function queryOne<T>(sql: string, values?: any[]): Promise<T | null> {
  const results = await query<T>(sql, values);
  return results.length > 0 ? results[0] : null;
}

export async function insert(table: string, data: Record<string, any>) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  return execute(sql, values);
}

export async function update(table: string, id: string, data: Record<string, any>) {
  const keys = Object.keys(data);
  const values = [...Object.values(data), id];
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
  return execute(sql, values);
}

export async function deleteRecord(table: string, id: string) {
  const sql = `DELETE FROM ${table} WHERE id = ?`;
  return execute(sql, [id]);
}
