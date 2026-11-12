import { randomUUID } from 'node:crypto';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { loadBears } from './bears.js';
import { NotFoundError, ValidationError } from './errors.js';

export const inputSchema = z.object({
    author: z.string().trim().min(1).max(80),
    text: z.string().trim().min(1).max(1000),
});

type Comment = z.infer<typeof inputSchema> & {
    id: string;
    bearId: string | null;
};

async function requireBear(id: string): Promise<void> {
    const bears = await loadBears();

    if (!bears.some((bear) => bear.id === id)) {
        throw new NotFoundError('Bear not found.');
    }
}

export function registerCommentRoutes(app: FastifyInstance): void {
    const comments = new Map<string, Comment>();

    function listComments(bearId: string | null): Comment[] {
        return Array.from(comments.values()).filter(
            (comment) => comment.bearId === bearId
        );
    }

    async function createComment(
        body: unknown,
        bearId: string | null,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        const input = inputSchema.safeParse(body);

        if (!input.success) {
            throw new ValidationError(
                'Enter an author of 1–80 characters and a comment of 1–1000 characters.',
                input.error.issues.map((issue) => ({
                    field: issue.path.map(String).join('.') || 'body',
                    message: issue.message,
                }))
            );
        }

        if (bearId !== null) {
            await requireBear(bearId);
        }

        const comment: Comment = {
            id: randomUUID(),
            bearId,
            ...input.data,
        };

        comments.set(comment.id, comment);

        return reply
            .code(201)
            .header('Location', `/api/comments/${comment.id}`)
            .send(comment);
    }

    app.get('/api/comments', async () => listComments(null));

    app.post<{ Body: unknown }>('/api/comments', async ({ body }, reply) =>
        createComment(body, null, reply)
    );

    app.get<{ Params: { id: string } }>(
        '/api/bears/:id/comments',
        async ({ params }) => {
            await requireBear(params.id);
            return listComments(params.id);
        }
    );

    app.post<{ Params: { id: string }; Body: unknown }>(
        '/api/bears/:id/comments',
        async ({ params, body }, reply) => createComment(body, params.id, reply)
    );

    app.get<{ Params: { commentId: string } }>(
        '/api/comments/:commentId',
        async ({ params }) => {
            const comment = comments.get(params.commentId);

            if (comment === undefined) {
                throw new NotFoundError('Comment not found.');
            }

            return comment;
        }
    );

    app.delete<{ Params: { commentId: string } }>(
        '/api/comments/:commentId',
        async ({ params }, reply) => {
            if (!comments.delete(params.commentId)) {
                throw new NotFoundError('Comment not found.');
            }

            return reply.code(204).send();
        }
    );
}
