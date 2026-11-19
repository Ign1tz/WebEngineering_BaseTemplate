import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { z } from 'zod';

import { bearSchema } from '../bears.js';
import { bears, comments } from '../db/schema.js';
import { NotFoundError } from '../errors.js';
import type { Repositories } from './contracts.js';

const bearFields = {
    id: bears.id,
    name: bears.name,
    binomial: bears.binomial,
    range: bears.range,
    image: bears.imageUrl,
};

const commentFields = {
    id: comments.id,
    bearId: comments.bearId,
    author: comments.author,
    text: comments.text,
};

const commentIdSchema = z.uuid();

export function createDrizzleRepositories(db: NodePgDatabase): Repositories {
    return {
        bears: {
            async list(query) {
                const filter = query
                    ? sql`strpos(lower(${bears.name}), lower(${query})) > 0`
                    : undefined;

                const rows = await db
                    .select(bearFields)
                    .from(bears)
                    .where(filter)
                    .orderBy(asc(bears.name), asc(bears.id));

                return rows.map((row) => bearSchema.parse(row));
            },

            async findById(id) {
                const [row] = await db
                    .select(bearFields)
                    .from(bears)
                    .where(eq(bears.id, id))
                    .limit(1);

                return row ? bearSchema.parse(row) : undefined;
            },
        },

        comments: {
            async list(bearId) {
                const filter = bearId === null
                    ? isNull(comments.bearId)
                    : eq(comments.bearId, bearId);

                return db
                    .select(commentFields)
                    .from(comments)
                    .where(filter)
                    .orderBy(asc(comments.createdAt), asc(comments.id));
            },

            async listPage(bearId, limit, cursor) {
                const afterCursor = cursor
                    ? sql`(${comments.createdAt}, ${comments.id}) >
                          (${cursor.createdAt}::timestamptz, ${cursor.id}::uuid)`
                    : undefined;

                const rows = await db
                    .select({
                        ...commentFields,
                        createdAt: sql<string>`to_char(
                            ${comments.createdAt} AT TIME ZONE 'UTC',
                            'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
                        )`,
                    })
                    .from(comments)
                    .where(and(eq(comments.bearId, bearId), afterCursor))
                    .orderBy(asc(comments.createdAt), asc(comments.id))
                    .limit(limit + 1);

                const page = rows.slice(0, limit);
                const last = page.at(-1);

                return {
                    items: page.map(({ id, bearId, author, text }) => ({
                        id,
                        bearId,
                        author,
                        text,
                    })),
                    nextCursor: rows.length > limit && last
                        ? { createdAt: last.createdAt, id: last.id }
                        : null,
                };
            },

            async findById(id) {
                if (!commentIdSchema.safeParse(id).success) {
                    return undefined;
                }

                const [row] = await db
                    .select(commentFields)
                    .from(comments)
                    .where(eq(comments.id, id))
                    .limit(1);

                return row;
            },

            async create(bearId, input) {
                try {
                    const [row] = await db
                        .insert(comments)
                        .values({ ...input, bearId })
                        .returning(commentFields);

                    if (!row) {
                        throw new Error('Comment insert returned no row');
                    }

                    return row;
                } catch (error) {
                    const cause = error instanceof Error ? error.cause ?? error : error;

                    if (
                        bearId !== null &&
                        cause instanceof Error &&
                        'code' in cause &&
                        cause.code === '23503'
                    ) {
                        throw new NotFoundError('Bear not found.');
                    }

                    throw error;
                }
            },

            async delete(id) {
                if (!commentIdSchema.safeParse(id).success) {
                    return false;
                }

                const deleted = await db
                    .delete(comments)
                    .where(eq(comments.id, id))
                    .returning({ id: comments.id });

                return deleted.length > 0;
            },
        },
    };
}