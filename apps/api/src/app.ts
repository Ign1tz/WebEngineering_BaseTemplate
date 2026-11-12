import Fastify from 'fastify';

export function createApp(version: string) {
    const app = Fastify();
    const startedAt = process.uptime();

    app.get('/health', async () => ({
        status: 'ok',
        version,
        uptime: process.uptime() - startedAt,
    }));

    return app;
}
