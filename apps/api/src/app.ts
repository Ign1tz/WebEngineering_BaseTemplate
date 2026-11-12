import Fastify from 'fastify';
import { registerBearRoutes } from './bears.js';
import { registerCommentRoutes } from './comments.js';

export function createApp(version: string) {
    const app = Fastify();
    const startedAt = process.uptime();

    app.get('/health', async () => ({
        status: 'ok',
        version,
        uptime: process.uptime() - startedAt,
    }));

    registerBearRoutes(app);
    registerCommentRoutes(app);

    return app;
}