import { randomUUID } from 'node:crypto';

import { NotFoundError } from '../errors.js';
import type { Bear, Comment, Repositories } from './contracts.js';

interface StoredComment {
    comment: Comment;
    createdAt: string;
}

export function createMemoryRepositories(
    seedBears: readonly Bear[] = [],
): Repositories {
    const bears = new Map(seedBears.map((bear) => [bear.id, bear]));
    const comments = new Map<string, StoredComment>();

    return {
        bears: {
            async list(query = '') {
                const filter = query.trim().toLowerCase();

                return [...bears.values()]
                    .filter((bear) => bear.name.toLowerCase().includes(filter))
                    .sort((a, b) =>
                        a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
                    );
            },

            async findById(id) {
                return bears.get(id);
            },
        },

        comments: {
            async list(bearId) {
                return [...comments.values()]
                    .map(({ comment }) => comment)
                    .filter((comment) => comment.bearId === bearId);
            },

            async listPage(bearId, limit, cursor) {
                const rows = [...comments.values()]
                    .filter(({ comment, createdAt }) =>
                            comment.bearId === bearId && (
                                !cursor ||
                                createdAt > cursor.createdAt ||
                                (createdAt === cursor.createdAt && comment.id > cursor.id)
                            ),
                    )
                    .sort((a, b) =>
                        a.createdAt.localeCompare(b.createdAt) ||
                        a.comment.id.localeCompare(b.comment.id),
                    )
                    .slice(0, limit + 1);

                const page = rows.slice(0, limit);
                const last = page.at(-1);

                return {
                    items: page.map(({ comment }) => comment),
                    nextCursor: rows.length > limit && last
                        ? { id: last.comment.id, createdAt: last.createdAt }
                        : null,
                };
            },

            async findById(id) {
                return comments.get(id)?.comment;
            },

            async create(bearId, input) {
                if (bearId !== null && !bears.has(bearId)) {
                    throw new NotFoundError('Bear not found.');
                }

                const comment: Comment = { ...input, id: randomUUID(), bearId };
                const createdAt = new Date().toISOString().replace(/Z$/, '000Z');

                comments.set(comment.id, { comment, createdAt });
                return comment;
            },

            async delete(id) {
                return comments.delete(id);
            },
        },
    };
}