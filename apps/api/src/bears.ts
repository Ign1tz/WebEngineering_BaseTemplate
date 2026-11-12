import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { NotFoundError, UpstreamError } from './errors.js';

const wikipediaApi =
    process.env.WIKIPEDIA_API_URL || 'https://en.wikipedia.org/w/api.php';

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

export const bearSchema = z.object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().trim().min(1),
    binomial: z.string().trim().min(1),
    range: z.string().trim().min(1),
    image: z.string().startsWith('/api/bears/images/'),
});

type Bear = z.infer<typeof bearSchema>;

const articleSchema = z.object({
    parse: z.object({ wikitext: z.object({ '*': z.string() }) }),
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

async function fetchUpstream(url: URL, signal: AbortSignal): Promise<Response> {
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

    const response = await fetchUpstream(url, signal);
    return await response.json();
}

function normalizeTitle(title: string): string {
    return title.replaceAll('_', ' ').normalize();
}

export async function loadBears(): Promise<Bear[]> {
    const signal = AbortSignal.timeout(10_000);

    try {
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
                const binomial = row
                    .match(/\|\s*binomial\s*=([^|\n]+)/)?.[1]
                    ?.trim();
                const title = row
                    .match(/\|\s*image\s*=\s*(File:[^|\n]+)/i)?.[1]
                    ?.trim();
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
                const id = fullBinomial
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-');

                return { id, name, binomial, title, range };
            });

        if (
            rows.length === 0 ||
            new Set(rows.map(({ id }) => id)).size !== rows.length
        ) {
            throw new Error('Missing or duplicate bear species');
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
    } catch (error) {
        throw new UpstreamError(signal.aborted ? signal.reason : error);
    }
}

export function registerBearRoutes(app: FastifyInstance): void {
    app.get('/api/bears', async () => loadBears());

    app.get<{ Params: { id: string } }>(
        '/api/bears/:id',
        async ({ params }) => {
            const bears = await loadBears();
            const bear = bears.find(({ id }) => id === params.id);

            if (bear === undefined) {
                throw new NotFoundError('Bear not found.');
            }

            return bear;
        }
    );

    app.get<{ Params: { path: string } }>(
        '/api/bears/images/:path',
        async ({ params }, reply) => {
            const path = params.path;

            if (!imagePathPattern.test(path)) {
                throw new NotFoundError('Image not found.');
            }

            const url = new URL(path, imageOrigin);

            if (url.pathname !== path || url.search || url.hash) {
                throw new NotFoundError('Image not found.');
            }

            const signal = AbortSignal.timeout(10_000);

            try {
                const response = await fetchUpstream(url, signal);
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
            } catch (error) {
                throw new UpstreamError(signal.aborted ? signal.reason : error);
            }
        }
    );
}
