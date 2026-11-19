import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createApp } from './app.js';
import type { Bear, Comment } from './repositories/contracts.js';
import { createMemoryRepositories } from './repositories/memory.js';

const testBear: Bear = {
    id: 'ursus-maritimus',
    name: 'Polar bear',
    binomial: 'Ursus maritimus',
    range: 'Arctic',
    image: '/api/bears/images/test-image',
};

test('GET /health returns the API status, version, and uptime', async (t) => {
    const app = createApp('0.1.0', {
        repositories: createMemoryRepositories(),
    });
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

test('bear and comment routes work with in-memory repositories', async (t) => {
    const app = createApp('0.1.0', {
        repositories: createMemoryRepositories([testBear]),
    });
    t.after(() => app.close());

    const bearsResponse = await app.inject({ method: 'GET', url: '/api/bears' });
    assert.equal(bearsResponse.statusCode, 200);
    assert.deepEqual(bearsResponse.json(), [testBear]);

    const baseUrl = `/api/bears/${testBear.id}/comments`;
    const created = await app.inject({
        method: 'POST',
        url: baseUrl,
        payload: { author: 'Test', text: 'A bear comment' },
    });

    assert.equal(created.statusCode, 201);
    const comment = created.json<Comment>();
    assert.equal(comment.bearId, testBear.id);

    const commentUrl = `/api/comments/${comment.id}`;
    assert.equal(created.headers.location, commentUrl);

    const list = await app.inject({ method: 'GET', url: baseUrl });
    assert.equal(list.statusCode, 200);
    assert.deepEqual(list.json(), [comment]);

    const generalList = await app.inject({ method: 'GET', url: '/api/comments' });
    assert.equal(generalList.statusCode, 200);
    assert.deepEqual(generalList.json(), []);

    const found = await app.inject({ method: 'GET', url: commentUrl });
    assert.equal(found.statusCode, 200);
    assert.deepEqual(found.json(), comment);

    const deleted = await app.inject({ method: 'DELETE', url: commentUrl });
    assert.equal(deleted.statusCode, 204);

    const missing = await app.inject({ method: 'GET', url: commentUrl });
    assert.equal(missing.statusCode, 404);
});