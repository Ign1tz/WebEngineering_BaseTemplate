import { Pool } from 'pg';
import { z } from 'zod';

import { createApp } from './app.js';

const envSchema = z.object({
    DATABASE_URL: z.string().url().refine(
        (url) => /^postgres(?:ql)?:\/\//.test(url),
        { message: 'Expected a PostgreSQL connection URL' },
    ),
    WIKIPEDIA_API_URL: z.preprocess(
        (value) => (value === '' ? undefined : value),
        z.string().url().optional(),
    ),
    API_HOST: z.string().min(1).default('0.0.0.0'),
    npm_package_version: z.string().min(1).default('0.1.0'),
});

const env = envSchema.parse(process.env);

const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    connectionTimeoutMillis: 2_000,
    query_timeout: 2_000,
});

pool.on('error', (error) => {
    console.warn('Idle PostgreSQL connection failed', error);
});

const app = createApp(env.npm_package_version, pool);

app.addHook('onClose', async () => {
    await pool.end();
});

try {
    const address = await app.listen({
        host: env.API_HOST,
        port: 3000,
    });

    console.log(`API listening on ${address}`);
} catch (error) {
    console.error(error);
    process.exitCode = 1;
    await app.close();
}