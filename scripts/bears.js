// Fetching bear data
const baseUrl = "https://en.wikipedia.org/w/api.php";
const title = "List_of_ursids";

const params = {
    action: "parse",
    page: title,
    prop: "wikitext",
    section: 3,
    format: "json",
    origin: "*"
};

async function fetchImageUrl(fileName) {
    const imageParams = {
        action: "query",
        titles: "File:" + fileName,
        prop: "imageinfo",
        iiprop: "url",
        format: "json",
        origin: "*"
    };

    const url = baseUrl + "?" + new URLSearchParams(imageParams).toString();

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await res.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];

    if (!page.imageinfo || !page.imageinfo[0]) {
        throw new Error('No image information available');
    }

    return page.imageinfo[0].url;
}

function checkImage(imageUrl) {
    return new Promise((resolve, reject) => {
        let image = new Image();

        image.onload = () => {
            resolve(imageUrl);
        };

        image.onerror = () => {
            reject(new Error('Image could not be loaded'));
        };

        image.src = imageUrl;
    });
}

function renderBears(bears) {
    const moreBears = document.querySelector('.more_bears');
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

async function extractBears(wikitext) {
    const speciesTables = wikitext.split('{{Species table/end}}');
    const bearPromises = [];

    speciesTables.forEach(function(table) {
        const rows = table.split('{{Species table/row');

        rows.forEach(function(row) {
            let nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
            let binomialMatch = row.match(/\|binomial=(.*?)\n/);
            let imageMatch = row.match(/\|image=(.*?)\n/);
            let rangeMatch = row.match(/\|range=(.*?)(?=\s*\|range-image=)/);

            if (nameMatch && binomialMatch && imageMatch && rangeMatch) {
                const fileName = imageMatch[1].trim().replace('File:', '');

                let bearPromise = (async () => {
                    let imageUrl;

                    try {
                        imageUrl = await fetchImageUrl(fileName);
                        imageUrl = await checkImage(imageUrl);
                    } catch (error) {
                        console.error('Error loading image:', error);
                        imageUrl = "media/placeholder.png";
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


export async function initializeBears() {
    try {
        let res = await fetch(baseUrl + "?" + new URLSearchParams(params).toString());

        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        let data = await res.json();

        if (!data.parse || !data.parse.wikitext || !data.parse.wikitext['*']) {
            throw new Error('Invalid bear data received');
        }

        await extractBears(data.parse.wikitext['*']);
    } catch (error) {
        console.error('Error fetching bear data:', error);

        let moreBears = document.querySelector('.more_bears');
        moreBears.innerHTML += '<p>Could not load bear data.</p>';
    }
}