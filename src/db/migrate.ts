import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from './connection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
    console.log('[MIGRATE] Starting database migration...');

    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

        console.log('[MIGRATE] Executing schema.sql...');

        const client = await db.getClient();
        try {
            await client.query(schemaSql);

            const migrationsDir = path.join(__dirname, 'migrations');
            if (fs.existsSync(migrationsDir)) {
                const migrationFiles = fs
                    .readdirSync(migrationsDir)
                    .filter((file) => file.endsWith('.sql'))
                    .sort();

                for (const file of migrationFiles) {
                    const filePath = path.join(migrationsDir, file);
                    const migrationSql = fs.readFileSync(filePath, 'utf-8');
                    console.log(`[MIGRATE] Executing ${file}...`);
                    await client.query(migrationSql);
                }
            }

            console.log('[MIGRATE] ✅ Migration completed successfully!');
        } finally {
            client.release();
        }

    } catch (err) {
        console.error('[MIGRATE] ❌ Error:', err);
        throw err;
    } finally {
        await db.closePool();
    }
}

migrate().catch((err) => {
    console.error('[MIGRATE] Fatal error:', err);
    process.exit(1);
});
