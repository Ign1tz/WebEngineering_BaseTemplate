import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createApp } from './app.js';
import type { Bear, Comment } from './repositories/contracts.js';
import { createMemoryRepositories } from './repositories/memory.js';

const bear: Bear = {
    id: 'ursus-maritimus',
    name: 'Polar bear',
    binomial: 'Ursus maritimus',
    range: 'Arctic',
    image: '/api/bears/images/test-image',
};

interface CommentPageResponse {
    items: Comment[];
    nextCursor: string | null;
}

test('GET /health returns the API status, version, and uptime', async (t) => {
    const app = createApp('0.1.0', { repositories: createMemoryRepositories() });
    t.after(() => app.close());

    const response = await app.inject('/health');
    assert.equal(response.statusCode, 200);
    assert.match(response.headers['content-type'] ?? '', /^application\/json/);

    const { status, version, uptime } = response.json();
    assert.equal(status, 'ok');
    assert.equal(version, '0.1.0');
    assert.equal(typeof uptime, 'number');
    assert.ok(Number.isFinite(uptime) && uptime >= 0);
});

test('bear search and comment pagination use the injected repositories', async (t) => {
    const app = createApp('0.1.0', {
        repositories: createMemoryRepositories([bear]),
    });
    t.after(() => app.close());

    const matchingBears = await app.inject('/api/bears?q=POLAR');
    assert.equal(matchingBears.statusCode, 200);
    assert.deepEqual(matchingBears.json(), [bear]);
    assert.deepEqual((await app.inject('/api/bears?q=panda')).json(), []);

    const url = `/api/bears/${bear.id}/comments`;
    const createdIds = new Set<string>();

    for (const text of ['First', 'Second']) {
        const created = await app.inject({
            method: 'POST',
            url,
            payload: { author: 'Test', text },
        });

        assert.equal(created.statusCode, 201);
        const comment = created.json<Comment>();
        assert.equal(comment.bearId, bear.id);
        assert.equal(created.headers.location, `/api/comments/${comment.id}`);
        createdIds.add(comment.id);
    }

    const first = await app.inject(`${url}?limit=1`);
    assert.equal(first.statusCode, 200);
    const page = first.json<CommentPageResponse>();
    assert.equal(page.items.length, 1);
    assert.ok(page.nextCursor);

    const second = await app.inject(`${url}?limit=1&cursor=${encodeURIComponent(page.nextCursor)}`);
    assert.equal(second.statusCode, 200);
    const last = second.json<CommentPageResponse>();
    assert.equal(last.items.length, 1);
    assert.equal(last.nextCursor, null);

    const seenIds = new Set([...page.items, ...last.items].map(({ id }) => id));
    assert.deepEqual(seenIds, createdIds);

    assert.equal((await app.inject(`${url}?cursor=bad`)).statusCode, 400);
    assert.equal((await app.inject(`${url}?limit=0`)).statusCode, 400);

    const [firstId] = createdIds;
    const commentUrl = `/api/comments/${firstId}`;
    assert.equal((await app.inject(commentUrl)).statusCode, 200);
    assert.equal((await app.inject({ method: 'DELETE', url: commentUrl })).statusCode, 204);
    assert.equal((await app.inject(commentUrl)).statusCode, 404);
    assert.deepEqual((await app.inject('/api/comments')).json(), []);

    const general = await app.inject({
        method: 'POST',
        url: '/api/comments',
        payload: { author: 'Test', text: 'General comment' },
    });

    assert.equal(general.statusCode, 201);
    assert.equal(general.json<Comment>().bearId, null);
    assert.deepEqual((await app.inject('/api/comments')).json(), [general.json()]);
});