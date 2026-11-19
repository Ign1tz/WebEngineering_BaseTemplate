import { asc, eq, isNull } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { z } from 'zod';

import { bears, comments } from '../db/schema.js';
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

const imageSchema = z.string().startsWith('/api/bears/images/');
const commentIdSchema = z.uuid();

function toBear(row: {
    id: string;
    name: string;
    binomial: string;
    range: string;
    image: string | null;
}) {
    return { ...row, image: imageSchema.parse(row.image) };
}

export function createDrizzleRepositories(db: NodePgDatabase): Repositories {
    return {
        bears: {
            async list() {
                const rows = await db
                    .select(bearFields)
                    .from(bears)
                    .orderBy(asc(bears.name), asc(bears.id));

                return rows.map(toBear);
            },

            async findById(id) {
                const [row] = await db
                    .select(bearFields)
                    .from(bears)
                    .where(eq(bears.id, id))
                    .limit(1);

                return row ? toBear(row) : undefined;
            },
        },

        comments: {
            async list(bearId) {
                return db
                    .select(commentFields)
                    .from(comments)
                    .where(bearId === null
                        ? isNull(comments.bearId)
                        : eq(comments.bearId, bearId))
                    .orderBy(asc(comments.createdAt), asc(comments.id));
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
                const [row] = await db
                    .insert(comments)
                    .values({ ...input, bearId })
                    .returning(commentFields);

                if (!row) {
                    throw new Error('Comment insert returned no row');
                }

                return row;
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