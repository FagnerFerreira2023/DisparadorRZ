import { Pool, type PoolClient } from 'pg';
import { config } from '../config.js';

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client', err);
    process.exit(-1);
});

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (duration > 1000) {
            console.warn(`[DB] Slow query (${duration}ms): ${text.substring(0, 100)}`);
        }
        return res.rows;
    } catch (err) {
        console.error('[DB] Query error:', err);
        throw err;
    }
}

export async function getClient(): Promise<PoolClient> {
    return pool.connect();
}

export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function closePool(): Promise<void> {
    await pool.end();
}

export default { query, getClient, transaction, closePool };
