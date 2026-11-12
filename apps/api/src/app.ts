import Fastify from 'fastify';
import { registerBearRoutes } from './bears.js';

export function createApp(version: string) {
    const app = Fastify();
    const startedAt = process.uptime();

    app.get('/health', async () => ({
        status: 'ok',
        version,
        uptime: process.uptime() - startedAt,
    }));

    registerBearRoutes(app);

    return app;
}