import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { z } from 'zod';

import { loadBears } from '../bears.js';
import { bears } from './schema.js';

const databaseUrl = z.string().url().parse(process.env.DATABASE_URL);
const sourceBears = await loadBears();
const fetchedAt = new Date();

const seedRows = sourceBears.map(({ image, ...bear }) => ({
    ...bear,
    imageUrl: image,
    fetchedAt,
}));

const pool = new Pool({ connectionString: databaseUrl });

try {
    const db = drizzle(pool);

    await db
        .insert(bears)
        .values(seedRows)
        .onConflictDoUpdate({
            target: bears.id,
            set: {
                name: sql`excluded.name`,
                binomial: sql`excluded.binomial`,
                imageUrl: sql`excluded.image_url`,
                range: sql`excluded.range`,
                fetchedAt: sql`excluded.fetched_at`,
            },
        });

    console.log(`Seeded ${seedRows.length} bears`);
} finally {
    await pool.end();
}