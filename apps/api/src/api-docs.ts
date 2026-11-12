import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance, FastifySchema } from 'fastify';
import { z } from 'zod';
import { bearSchema } from './bears.js';
import { inputSchema } from './comments.js';

function jsonSchema(schema: z.ZodType, io: 'input' | 'output' = 'output') {
    const result = z.toJSONSchema(schema, { io });
    delete result.$schema;
    return result;
}

const commentSchema = inputSchema.extend({
    id: z.uuid(),
    bearId: z.string().nullable(),
});

const problemSchema = z.object({
    type: z.string(),
    title: z.string(),
    status: z.number().int(),
    detail: z.string(),
    instance: z.string(),
    errors: z
        .array(z.object({ field: z.string(), message: z.string() }))
        .optional(),
});

const problemJsonSchema = jsonSchema(problemSchema) as { type: 'object' };

const problem = {
    description: 'Problem Details',
    content: {
        'application/problem+json': { schema: problemJsonSchema },
    },
};

const bearParams = jsonSchema(z.object({ id: z.string().min(1) }));
const commentParams = jsonSchema(z.object({ commentId: z.string().min(1) }));
const commentBody = jsonSchema(inputSchema, 'input');
const commentList = jsonSchema(z.array(commentSchema));
const commentResponse = jsonSchema(commentSchema);

const created = {
    ...commentResponse,
    description: 'Comment created',
    headers: {
        Location: {
            type: 'string',
            description: 'URL of the created comment',
        },
    },
};

type RouteContract = FastifySchema & {
    response: Record<number, unknown>;
};

const contracts: Record<string, RouteContract> = {
    'GET /health': {
        response: {
            200: jsonSchema(
                z.object({
                    status: z.literal('ok'),
                    version: z.string(),
                    uptime: z.number().nonnegative(),
                })
            ),
        },
    },
    'GET /api/bears': {
        response: {
            200: jsonSchema(z.array(bearSchema)),
            502: problem,
            504: problem,
        },
    },
    'GET /api/bears/:id': {
        params: bearParams,
        response: {
            200: jsonSchema(bearSchema),
            404: problem,
            502: problem,
            504: problem,
        },
    },
    'GET /api/bears/images/:path': {
        params: jsonSchema(z.object({ path: z.string() })),
        response: {
            200: {
                description: 'Bear image',
                content: {
                    'image/*': {
                        schema: { type: 'string', format: 'binary' },
                    },
                },
            },
            404: problem,
            502: problem,
            504: problem,
        },
    },
    'GET /api/comments': {
        response: { 200: commentList },
    },
    'POST /api/comments': {
        body: commentBody,
        response: { 201: created, 400: problem },
    },
    'GET /api/bears/:id/comments': {
        params: bearParams,
        response: {
            200: commentList,
            404: problem,
            502: problem,
            504: problem,
        },
    },
    'POST /api/bears/:id/comments': {
        params: bearParams,
        body: commentBody,
        response: {
            201: created,
            400: problem,
            404: problem,
            502: problem,
            504: problem,
        },
    },
    'GET /api/comments/:commentId': {
        params: commentParams,
        response: { 200: commentResponse, 404: problem },
    },
    'DELETE /api/comments/:commentId': {
        params: commentParams,
        response: { 204: { description: 'No content' }, 404: problem },
    },
    'GET /api/debug/error': {
        response: { 500: problem },
    },
};

export function registerApiDocs(app: FastifyInstance, version: string): void {
    void app.register(swagger, {
        openapi: {
            openapi: '3.1.0',
            info: { title: 'Bears API', version },
            components: {
                schemas: { ProblemDetails: problemJsonSchema },
            },
        },
        transform({ schema, url, route }) {
            const path = url.replace(/\/$/, '') || '/';
            const contract = contracts[`${route.method} ${path}`];

            if (contract === undefined) {
                return { schema: { ...schema, hide: true }, url };
            }

            return {
                schema: {
                    ...schema,
                    ...contract,
                    response: { 500: problem, ...contract.response },
                },
                url: path,
            };
        },
    });

    void app.register(swaggerUi, { routePrefix: '/api/docs' });
}