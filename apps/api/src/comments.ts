import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';

import { NotFoundError, ValidationError } from './errors.js';
import type { BearRepository, CommentRepository } from './repositories/contracts.js';

export const inputSchema = z.object({
    author: z.string().trim().min(1).max(80),
    text: z.string().trim().min(1).max(1000),
});

export function registerCommentRoutes(
    app: FastifyInstance,
    bears: BearRepository,
    comments: CommentRepository,
): void {
    async function requireBear(id: string): Promise<void> {
        if (!(await bears.findById(id))) {
            throw new NotFoundError('Bear not found.');
        }
    }

    async function createComment(
        body: unknown,
        bearId: string | null,
        reply: FastifyReply,
    ): Promise<FastifyReply> {
        const input = inputSchema.safeParse(body);

        if (!input.success) {
            throw new ValidationError(
                'Enter an author of 1–80 characters and a comment of 1–1000 characters.',
                input.error.issues.map((issue) => ({
                    field: issue.path.map(String).join('.') || 'body',
                    message: issue.message,
                })),
            );
        }

        if (bearId !== null) {
            await requireBear(bearId);
        }

        const comment = await comments.create(bearId, input.data);

        return reply
            .code(201)
            .header('Location', `/api/comments/${comment.id}`)
            .send(comment);
    }

    app.get('/api/comments', async () => comments.list(null));

    app.post<{ Body: unknown }>('/api/comments', async ({ body }, reply) =>
        createComment(body, null, reply),
    );

    app.get<{ Params: { id: string } }>(
        '/api/bears/:id/comments',
        async ({ params }) => {
            await requireBear(params.id);
            return comments.list(params.id);
        },
    );

    app.post<{ Params: { id: string }; Body: unknown }>(
        '/api/bears/:id/comments',
        async ({ params, body }, reply) => createComment(body, params.id, reply),
    );

    app.get<{ Params: { commentId: string } }>(
        '/api/comments/:commentId',
        async ({ params }) => {
            const comment = await comments.findById(params.commentId);

            if (!comment) {
                throw new NotFoundError('Comment not found.');
            }

            return comment;
        },
    );

    app.delete<{ Params: { commentId: string } }>(
        '/api/comments/:commentId',
        async ({ params }, reply) => {
            if (!(await comments.delete(params.commentId))) {
                throw new NotFoundError('Comment not found.');
            }

            return reply.code(204).send();
        },
    );
}