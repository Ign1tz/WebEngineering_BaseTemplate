import { randomUUID } from 'node:crypto';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { loadBears } from './bears.js';

const inputSchema = z.object({
    author: z.string().trim().min(1).max(80),
    text: z.string().trim().min(1).max(1000),
});

type CommentInput = z.infer<typeof inputSchema>;

type Comment = CommentInput & {
    id: string;
    bearId: string | null;
};

async function requireBear(id: string, reply: FastifyReply): Promise<boolean> {
    try {
        const bears = await loadBears();

        if (bears.some((bear) => bear.id === id)) {
            return true;
        }

        reply.code(404).send({ error: 'Bear not found' });
    } catch (error) {
        const timedOut =
            error instanceof Error && error.name === 'TimeoutError';

        reply.code(timedOut ? 504 : 502).send({
            error: timedOut
                ? 'Wikimedia request timed out'
                : 'Could not load Wikimedia data',
        });
    }

    return false;
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
            return reply.code(400).send({
                error: 'Author must be 1–80 characters and text must be 1–1000 characters.',
            });
        }

        if (bearId !== null && !(await requireBear(bearId, reply))) {
            return reply;
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
        async ({ params }, reply) => {
            if (!(await requireBear(params.id, reply))) {
                return reply;
            }

            return listComments(params.id);
        }
    );

    app.post<{ Params: { id: string }; Body: unknown }>(
        '/api/bears/:id/comments',
        async ({ params, body }, reply) =>
            createComment(body, params.id, reply)
    );

    app.get<{ Params: { commentId: string } }>(
        '/api/comments/:commentId',
        async ({ params }, reply) => {
            const comment = comments.get(params.commentId);

            return (
                comment ?? reply.code(404).send({ error: 'Comment not found' })
            );
        }
    );

    app.delete<{ Params: { commentId: string } }>(
        '/api/comments/:commentId',
        async ({ params }, reply) => {
            if (!comments.delete(params.commentId)) {
                return reply.code(404).send({ error: 'Comment not found' });
            }

            return reply.code(204).send();
        }
    );
}