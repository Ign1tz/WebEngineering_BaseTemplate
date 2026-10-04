import type {
    Bear,
    WikipediaImageResponse,
    WikipediaParseResponse,
} from '../../types/types';

const baseUrl = 'https://en.wikipedia.org/w/api.php';
const title = 'List_of_ursids';

const params = {
    action: 'parse',
    page: title,
    prop: 'wikitext',
    section: '3',
    format: 'json',
    origin: '*',
};

function createBearId(binomial: string): string {
    return binomial
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function isWikipediaParseResponse(
    data: unknown
): data is WikipediaParseResponse {
    if (
        typeof data !== 'object' ||
        data === null ||
        !('parse' in data)
    ) {
        return false;
    }

    const parse = data.parse;

    if (
        typeof parse !== 'object' ||
        parse === null ||
        !('wikitext' in parse)
    ) {
        return false;
    }

    const wikitext = parse.wikitext;

    return (
        typeof wikitext === 'object' &&
        wikitext !== null &&
        '*' in wikitext &&
        typeof wikitext['*'] === 'string'
    );
}

function isWikipediaImageResponse(
    data: unknown
): data is WikipediaImageResponse {
    if (
        typeof data !== 'object' ||
        data === null ||
        !('query' in data)
    ) {
        return false;
    }

    const query = data.query;

    if (
        typeof query !== 'object' ||
        query === null ||
        !('pages' in query)
    ) {
        return false;
    }

    const pages = query.pages;

    if (typeof pages !== 'object' || pages === null) {
        return false;
    }

    const page = Object.values(pages)[0];

    if (
        typeof page !== 'object' ||
        page === null ||
        !('imageinfo' in page)
    ) {
        return false;
    }

    const imageInfo = page.imageinfo;

    return (
        Array.isArray(imageInfo) &&
        imageInfo.length > 0 &&
        typeof imageInfo[0] === 'object' &&
        imageInfo[0] !== null &&
        'url' in imageInfo[0] &&
        typeof imageInfo[0].url === 'string'
    );
}

async function fetchImageUrl(
    fileName: string,
    signal: AbortSignal
): Promise<string> {
    const imageParams = {
        action: 'query',
        titles: `File:${fileName}`,
        prop: 'imageinfo',
        iiprop: 'url',
        format: 'json',
        origin: '*',
    };

    const url =
        baseUrl +
        '?' +
        new URLSearchParams(imageParams).toString();

    const response = await fetch(url, { signal });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data: unknown = await response.json();

    if (!isWikipediaImageResponse(data)) {
        throw new Error('Invalid image data received');
    }

    const page = Object.values(data.query.pages)[0];

    return page.imageinfo[0].url;
}

async function checkImage(imageUrl: string): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
        const image = new Image();

        image.onload = () => {
            resolve(imageUrl);
        };

        image.onerror = () => {
            reject(new Error('Image could not be loaded'));
        };

        image.src = imageUrl;
    });
}

async function extractBears(
    wikitext: string,
    signal: AbortSignal
): Promise<Bear[]> {
    const speciesTables =
        wikitext.split('{{Species table/end}}');

    const bearPromises: Array<Promise<Bear>> = [];

    speciesTables.forEach((table) => {
        const rows = table.split('{{Species table/row');

        rows.forEach((row) => {
            const nameMatch =
                row.match(/\|name=\[\[(.*?)\]\]/);
            const binomialMatch =
                row.match(/\|binomial=(.*?)\n/);
            const imageMatch =
                row.match(/\|image=(.*?)\n/);
            const rangeMatch =
                row.match(/\|range=(.*?)(?=\s*\|range-image=)/);

            if (
                nameMatch !== null &&
                binomialMatch !== null &&
                imageMatch !== null &&
                rangeMatch !== null
            ) {
                const fileName = imageMatch[1]
                    .trim()
                    .replace('File:', '');

                const bearPromise =
                    async (): Promise<Bear> => {
                        let imageUrl: string;

                        try {
                            imageUrl = await fetchImageUrl(
                                fileName,
                                signal
                            );

                            imageUrl = await checkImage(imageUrl);
                        } catch (error) {
                            if (
                                error instanceof DOMException &&
                                error.name === 'AbortError'
                            ) {
                                throw error;
                            }

                            console.error(
                                'Error loading image:',
                                error
                            );

                            imageUrl = 'media/placeholder.png';
                        }

                        const binomial = binomialMatch[1].trim();

                        return {
                            id: createBearId(binomial),
                            name: nameMatch[1],
                            binomial,
                            image: imageUrl,
                            range: rangeMatch[1].trim(),
                        };
                    };

                bearPromises.push(bearPromise());
            }
        });
    });

    return await Promise.all(bearPromises);
}

export async function fetchBears(
    signal: AbortSignal
): Promise<Bear[]> {
    const response = await fetch(
        baseUrl +
        '?' +
        new URLSearchParams(params).toString(),
        { signal }
    );

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data: unknown = await response.json();

    if (!isWikipediaParseResponse(data)) {
        throw new Error('Invalid bear data received');
    }

    return await extractBears(
        data.parse.wikitext['*'],
        signal
    );
}