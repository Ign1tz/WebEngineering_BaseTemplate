import { randomUUID } from 'node:crypto';
import Fastify from 'fastify';
import { registerBearRoutes } from './bears.js';
import { registerCommentRoutes } from './comments.js';
import { registerErrorHandling } from './errors.js';

export function createApp(version: string) {
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

    registerErrorHandling(app);

    app.get('/health', async () => ({
        status: 'ok',
        version,
        uptime: process.uptime() - startedAt,
    }));

    if (process.env.ENABLE_ERROR_TEST_ROUTE === '1') {
        app.get('/api/debug/error', async () => {
            throw new Error('Intentional test failure');
        });
    }

    registerBearRoutes(app);
    registerCommentRoutes(app);

    return app;
}
