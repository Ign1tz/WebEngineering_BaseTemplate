import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';

import { NotFoundError, ValidationError } from './errors.js';
import type {
    BearRepository,
    CommentCursor,
    CommentRepository,
} from './repositories/contracts.js';

export const inputSchema = z.object({
    author: z.string().trim().min(1).max(80),
    text: z.string().trim().min(1).max(1000),
});

const pageQuery = z.object({
    limit: z.string().regex(/^\d{1,3}$/)
        .transform(Number)
        .pipe(z.number().int().min(1).max(100))
        .optional(),
    cursor: z.string().min(1).max(256).regex(/^[a-zA-Z0-9_-]+$/).optional(),
});

const cursorSchema = z.object({
    createdAt: z.iso.datetime({ precision: 6 }),
    id: z.uuid(),
});

function decodeCursor(value: string): CommentCursor {
    try {
        const json = Buffer.from(value, 'base64url').toString('utf8');
        return cursorSchema.parse(JSON.parse(json));
    } catch {
        throw new ValidationError('Invalid comment cursor.', [
            { field: 'cursor', message: 'Use the nextCursor token from the previous page.' },
        ]);
    }
}

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

    app.get<{ Params: { id: string }; Querystring: unknown }>(
        '/api/bears/:id/comments',
        async ({ params, query }) => {
            const parsed = pageQuery.safeParse(query);

            if (!parsed.success) {
                throw new ValidationError(
                    'Invalid pagination parameters.',
                    parsed.error.issues.map((issue) => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                );
            }

            const { limit = 20, cursor } = parsed.data;
            const position = cursor === undefined ? undefined : decodeCursor(cursor);

            await requireBear(params.id);
            const page = await comments.listPage(params.id, limit, position);

            return {
                items: page.items,
                nextCursor: page.nextCursor
                    ? Buffer.from(JSON.stringify(page.nextCursor)).toString('base64url')
                    : null,
            };
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