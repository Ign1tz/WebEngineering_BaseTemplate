\set ON_ERROR_STOP on

BEGIN;

INSERT INTO bears (id, name, binomial, range)
SELECT 'benchmark-bear-' || n, 'Benchmark bear ' || n, 'Benchmark', 'Benchmark'
FROM generate_series(0, 99) AS n;

INSERT INTO comments (bear_id, author, text, created_at)
SELECT
'benchmark-bear-' || (n % 100),
    'Benchmark',
'Benchmark comment ' || n,
    TIMESTAMPTZ '2025-01-01 00:00:00+00' + n * INTERVAL '1 second'
FROM generate_series(1, 100000) AS n;

ANALYZE comments;

DROP INDEX IF EXISTS comments_bear_id_created_at_idx;
DROP INDEX IF EXISTS comments_bear_id_created_at_id_idx;

PREPARE continuation_page(text, timestamptz, uuid) AS
SELECT
id,
    bear_id,
    author,
    text,
    to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_created_at
FROM comments
WHERE bear_id = $1 AND (created_at, id) > ($2, $3)
ORDER BY created_at, id
LIMIT 21;

\echo WITHOUT INDEX
EXPLAIN (ANALYZE, BUFFERS)
EXECUTE continuation_page(
    'benchmark-bear-0',
    '2025-01-01 12:00:00+00',
    '00000000-0000-0000-0000-000000000000'
);

CREATE INDEX comments_bear_id_created_at_id_idx
ON comments (bear_id, created_at, id);

\echo WITH INDEX
EXPLAIN (ANALYZE, BUFFERS)
EXECUTE continuation_page(
    'benchmark-bear-0',
    '2025-01-01 12:00:00+00',
    '00000000-0000-0000-0000-000000000000'
);

DEALLOCATE continuation_page;
ROLLBACK;