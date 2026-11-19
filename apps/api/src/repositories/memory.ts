import { randomUUID } from 'node:crypto';

import type { Bear, Comment, Repositories } from './contracts.js';

export function createMemoryRepositories(seedBears: readonly Bear[] = []): Repositories {
    const bears = new Map(seedBears.map((bear) => [bear.id, bear]));
    const comments = new Map<string, Comment>();

    return {
        bears: {
            async list() {
                return [...bears.values()];
            },

            async findById(id) {
                return bears.get(id);
            },
        },

        comments: {
            async list(bearId) {
                return [...comments.values()].filter((comment) => comment.bearId === bearId);
            },

            async findById(id) {
                return comments.get(id);
            },

            async create(bearId, input) {
                const comment = { ...input, id: randomUUID(), bearId };
                comments.set(comment.id, comment);
                return comment;
            },

            async delete(id) {
                return comments.delete(id);
            },
        },
    };
}