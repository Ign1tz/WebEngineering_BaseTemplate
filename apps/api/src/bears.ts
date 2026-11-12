import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const wikipediaApi =
    process.env.WIKIPEDIA_API_URL ||
    'https://en.wikipedia.org/w/api.php';

const userAgent =
    'WebEngineeringBears/0.1 (https://github.com/Ign1tz/WebEngineering_BaseTemplate)';

const imageOrigin = 'https://upload.wikimedia.org';
const imagePathPattern =
    /^\/wikipedia\/(?:commons|en)\/[a-f0-9]\/[a-f0-9]{2}\/[^/]+$/;

const genera: Record<string, string> = {
    A: 'Ailuropoda',
    H: 'Helarctos',
    M: 'Melursus',
    T: 'Tremarctos',
    U: 'Ursus',
};

const bearSchema = z.object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().trim().min(1),
    binomial: z.string().trim().min(1),
    range: z.string().trim().min(1),
    image: z.string().startsWith('/api/bears/images/'),
});

type Bear = z.infer<typeof bearSchema>;

const articleSchema = z.object({
    parse: z.object({
        wikitext: z.object({ '*': z.string() }),
    }),
});

const imagesSchema = z.object({
    query: z.object({
        pages: z.array(
            z.object({
                title: z.string(),
                imageinfo: z.array(z.object({ url: z.url() })).min(1),
            })
        ),
    }),
});

async function fetchUpstream(
    url: URL,
    signal: AbortSignal
): Promise<Response> {
    const response = await fetch(url, {
        headers: { 'User-Agent': userAgent },
        redirect: 'error',
        signal,
    });

    if (!response.ok) {
        await response.body?.cancel();
        throw new Error(`Wikimedia returned HTTP ${response.status}`);
    }

    return response;
}

async function queryWikipedia(
    params: Record<string, string>,
    signal: AbortSignal
): Promise<unknown> {
    const url = new URL(wikipediaApi);
    url.search = new URLSearchParams({ format: 'json', ...params }).toString();

    try {
        const response = await fetchUpstream(url, signal);
        return await response.json();
    } catch (error) {
        signal.throwIfAborted();
        throw error;
    }
}

async function loadBears(): Promise<Bear[]> {
    const signal = AbortSignal.timeout(10_000);
    const article = articleSchema.parse(
        await queryWikipedia(
            {
                action: 'parse',
                page: 'List_of_ursids',
                prop: 'wikitext',
                section: '3',
            },
            signal
        )
    );

    const rows = article.parse.wikitext['*']
        .split(/\{\{Species table\/row\b/i)
        .slice(1)
        .map((row) => {
            const name = row
                .match(/\|\s*name\s*=\s*\[\[([^\]]+)\]\]/)?.[1]
                ?.split('|')
                .at(-1);
            const binomial = row.match(/\|\s*binomial\s*=([^|\n]+)/)?.[1]?.trim();
            const title = row.match(/\|\s*image\s*=\s*(File:[^|\n]+)/i)?.[1]?.trim();
            const range = row.match(
                /\|\s*range\s*=(.*?)(?=\s*\|\s*range-image\s*=)/
            )?.[1];

            if (!name || !binomial || !title || !range) {
                throw new Error('Incomplete bear row in Wikipedia article');
            }

            const initial = binomial.match(/^([A-Z])\.\s+/)?.[1];
            if (initial && !Object.hasOwn(genera, initial)) {
                throw new Error(`Unknown genus abbreviation: ${initial}`);
            }

            const fullBinomial = initial
                ? binomial.replace(/^[A-Z]\./, genera[initial])
                : binomial;
            const id = fullBinomial.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            return { id, name, binomial, title, range };
        });

    if (rows.length === 0 || new Set(rows.map(({ id }) => id)).size !== rows.length) {
        throw new Error('Missing or duplicate bear species in Wikipedia article');
    }

    const images = imagesSchema.parse(
        await queryWikipedia(
            {
                action: 'query',
                titles: rows.map(({ title }) => title).join('|'),
                prop: 'imageinfo',
                iiprop: 'url',
                formatversion: '2',
            },
            signal
        )
    );

    const normalizeTitle = (title: string) =>
        title.replaceAll('_', ' ').normalize();

    const imageUrls = new Map(
        images.query.pages.map(({ title, imageinfo }) => [
            normalizeTitle(title),
            new URL(imageinfo[0].url),
        ])
    );

    return rows.map(({ title, ...bear }) => {
        const image = imageUrls.get(normalizeTitle(title));

        if (
            !image ||
            image.origin !== imageOrigin ||
            !imagePathPattern.test(image.pathname)
        ) {
            throw new Error(`Missing or invalid Wikimedia image: ${title}`);
        }

        return bearSchema.parse({
            ...bear,
            image: `/api/bears/images/${encodeURIComponent(image.pathname)}`,
        });
    });
}

export function registerBearRoutes(app: FastifyInstance): void {
    void app.register(async (routes) => {
        routes.setErrorHandler((error, request, reply) => {
            request.log.warn({ err: error }, 'Wikimedia request failed');

            if (error instanceof Error && error.name === 'TimeoutError') {
                return reply.code(504).send({ error: 'Wikimedia request timed out' });
            }

            return reply.code(502).send({ error: 'Could not load Wikimedia data' });
        });

        routes.get('/api/bears', loadBears);

        routes.get<{ Params: { id: string } }>(
            '/api/bears/:id',
            async (request, reply) => {
                const bears = await loadBears();
                const bear = bears.find(({ id }) => id === request.params.id);
                return bear ?? reply.code(404).send({ error: 'Bear not found' });
            }
        );

        routes.get<{ Params: { path: string } }>(
            '/api/bears/images/:path',
            async (request, reply) => {
                const path = request.params.path;
                const url = new URL(path, imageOrigin);

                if (
                    !imagePathPattern.test(path) ||
                    url.pathname !== path ||
                    url.search ||
                    url.hash
                ) {
                    return reply.code(404).send({ error: 'Image not found' });
                }

                const response = await fetchUpstream(url, AbortSignal.timeout(10_000));
                const contentType = response.headers.get('content-type') ?? '';

                if (
                    !/^image\/(?:jpeg|png|webp|gif|avif)$/.test(contentType) ||
                    !response.body
                ) {
                    await response.body?.cancel();
                    throw new Error('Wikimedia returned an unsupported image');
                }

                return reply
                    .type(contentType)
                    .header('X-Content-Type-Options', 'nosniff')
                    .header('Cache-Control', 'public, max-age=3600')
                    .send(response.body);
            }
        );
    });
}