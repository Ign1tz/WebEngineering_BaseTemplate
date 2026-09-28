import type { Bear, WikipediaParseResponse, WikipediaImageResponse } from '../types/types';

const baseUrl = 'https://en.wikipedia.org/w/api.php';
const title = 'List_of_ursids';

const params = {
    action: 'parse',
    page: title,
    prop: 'wikitext',
    section: '3',
    format: 'json',
    origin: '*'
};

function isWikipediaParseResponse(data: unknown): data is WikipediaParseResponse {
    if (typeof data !== 'object' || data === null || !('parse' in data)) return false;

    const parse = data.parse;
    if (typeof parse !== 'object' || parse === null || !('wikitext' in parse)) return false;

    const wikitext = parse.wikitext;
    return typeof wikitext === 'object' &&
        wikitext !== null &&
        '*' in wikitext &&
        typeof wikitext['*'] === 'string';
}

function isWikipediaImageResponse(data: unknown): data is WikipediaImageResponse {
    if (typeof data !== 'object' || data === null || !('query' in data)) return false;

    const query = data.query;
    if (typeof query !== 'object' || query === null || !('pages' in query)) return false;

    const pages = query.pages;
    if (typeof pages !== 'object' || pages === null) return false;

    const page = Object.values(pages)[0];
    if (typeof page !== 'object' || page === null || !('imageinfo' in page)) return false;

    const imageInfo = page.imageinfo;

    return Array.isArray(imageInfo) &&
        imageInfo.length > 0 &&
        typeof imageInfo[0] === 'object' &&
        imageInfo[0] !== null &&
        'url' in imageInfo[0] &&
        typeof imageInfo[0].url === 'string';
}

async function fetchImageUrl(fileName: string): Promise<string> {
    const imageParams = {
        action: 'query',
        titles: 'File:' + fileName,
        prop: 'imageinfo',
        iiprop: 'url',
        format: 'json',
        origin: '*'
    };

    const url = baseUrl + '?' + new URLSearchParams(imageParams).toString();
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error('Network response was not ok');
    }

    const data: unknown = await res.json();

    if (!isWikipediaImageResponse(data)) {
        throw new Error('Invalid image data received');
    }

    const page = Object.values(data.query.pages)[0];
    return page.imageinfo[0].url;
}

function checkImage(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(imageUrl);
        image.onerror = () => reject(new Error('Image could not be loaded'));
        image.src = imageUrl;
    });
}

function renderBears(bears: Bear[]): void {
    const moreBears = document.querySelector<HTMLElement>('.more_bears');

    if (!moreBears) {
        console.error('More bears section could not be found.');
        return;
    }

    let html = '';

    bears.forEach((bear) => {
        html += '<div class="bear">' +
            '<img src="' + bear.image + '" alt="Image of ' + bear.name + '" style="width:200px; height:auto;">' +
            '<p><b>' + bear.name + '</b> (' + bear.binomial + ')</p>' +
            '<p>Range: ' + bear.range + '</p>' +
            '</div>';
    });

    moreBears.innerHTML += html;
}

async function extractBears(wikitext: string): Promise<void> {
    const speciesTables = wikitext.split('{{Species table/end}}');
    const bearPromises: Promise<Bear>[] = [];

    speciesTables.forEach((table: string) => {
        const rows = table.split('{{Species table/row');

        rows.forEach((row: string) => {
            const nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
            const binomialMatch = row.match(/\|binomial=(.*?)\n/);
            const imageMatch = row.match(/\|image=(.*?)\n/);
            const rangeMatch = row.match(/\|range=(.*?)(?=\s*\|range-image=)/);

            if (nameMatch && binomialMatch && imageMatch && rangeMatch) {
                const fileName = imageMatch[1].trim().replace('File:', '');

                const bearPromise: Promise<Bear> = (async () => {
                    let imageUrl: string;

                    try {
                        imageUrl = await fetchImageUrl(fileName);
                        imageUrl = await checkImage(imageUrl);
                    } catch (error) {
                        console.error('Error loading image:', error);
                        imageUrl = 'media/placeholder.png';
                    }

                    return {
                        name: nameMatch[1],
                        binomial: binomialMatch[1],
                        image: imageUrl,
                        range: rangeMatch[1].trim()
                    };
                })();

                bearPromises.push(bearPromise);
            }
        });
    });

    const bears = await Promise.all(bearPromises);
    renderBears(bears);
}

export async function initializeBears(): Promise<void> {
    try {
        const res = await fetch(baseUrl + '?' + new URLSearchParams(params).toString());

        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        const data: unknown = await res.json();

        if (!isWikipediaParseResponse(data)) {
            throw new Error('Invalid bear data received');
        }

        await extractBears(data.parse.wikitext['*']);
    } catch (error) {
        console.error('Error fetching bear data:', error);

        const moreBears = document.querySelector<HTMLElement>('.more_bears');

        if (moreBears) {
            moreBears.innerHTML += '<p>Could not load bear data.</p>';
        }
    }
}