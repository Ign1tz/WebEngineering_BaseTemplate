import { randomUUID } from 'node:crypto';

import cors from '@fastify/cors';
import Fastify from 'fastify';
import type { Pool } from 'pg';

import { registerApiDocs } from './api-docs.js';
import { registerBearRoutes } from './bears.js';
import { registerCommentRoutes } from './comments.js';
import { registerErrorHandling } from './errors.js';
import { drizzle } from "drizzle-orm/node-postgres";

export function createApp(version: string, pool?: Pool) {
    const db = pool ? drizzle(pool) : undefined;
    const app = Fastify({
        logger: true,
        requestIdHeader: false,
        genReqId(request) {
            const supplied = request.headers['x-request-id'];

            return typeof supplied === 'string' &&
            /^[a-zA-Z0-9._-]{1,100}$/.test(supplied)
                ? supplied
                : randomUUID();
        },
    });

    const startedAt = process.uptime();
    const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin !== '');

    registerErrorHandling(app);

    void app.register(cors, {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'DELETE'],
        allowedHeaders: ['Content-Type', 'X-Request-Id'],
        exposedHeaders: ['Location', 'X-Request-Id'],
    });

    registerApiDocs(app, version);

    void app.register(async (routes) => {
        routes.get('/health', async () => ({
            status: 'ok',
            version,
            uptime: process.uptime() - startedAt,
        }));

        routes.get('/health/ready', async (request, reply) => {
            if (pool) {
                try {
                    await pool.query('SELECT 1');
                    return reply.code(200).send({ status: 'ok' });
                } catch (error) {
                    request.log.warn({ err: error }, 'Database readiness check failed');
                }
            }

            return reply
                .code(503)
                .type('application/problem+json')
                .send({
                    type: 'about:blank',
                    title: 'Service Unavailable',
                    status: 503,
                    detail: 'The database is unavailable.',
                });
        });

        if (process.env.ENABLE_ERROR_TEST_ROUTE === '1') {
            routes.get('/api/debug/error', async () => {
                throw new Error('Intentional test failure');
            });
        }

        registerBearRoutes(routes, db);
        registerCommentRoutes(routes);
    });

    return app;
}