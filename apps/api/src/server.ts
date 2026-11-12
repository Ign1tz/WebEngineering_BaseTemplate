import { createApp } from './app.js';

const app = createApp(process.env.npm_package_version ?? '0.1.0');

try {
    const address = await app.listen({
        host: process.env.API_HOST ?? '0.0.0.0',
        port: 3000,
    });
    console.log(`API listening on ${address}`);
} catch (error) {
    console.error(error);
    process.exitCode = 1;
}
