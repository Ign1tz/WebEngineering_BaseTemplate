import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from './app.js';

test('GET /health returns the API status, version, and uptime', async (t) => {
    const app = createApp('0.1.0');
    t.after(() => app.close());

    const response = await app.inject({ method: 'GET', url: '/health' });

    assert.equal(response.statusCode, 200);
    assert.match(response.headers['content-type'] ?? '', /^application\/json/);

    const { status, version, uptime } = response.json();
    assert.equal(status, 'ok');
    assert.equal(version, '0.1.0');
    assert.equal(typeof uptime, 'number');
    assert.ok(Number.isFinite(uptime) && uptime >= 0);
});
