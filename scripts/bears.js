// Fetching bear data
let baseUrl = "https://en.wikipedia.org/w/api.php";
let title = "List_of_ursids";

let params = {
    action: "parse",
    page: title,
    prop: "wikitext",
    section: 3,
    format: "json",
    origin: "*"
};

function fetchImageUrl(fileName) {
    let imageParams = {
        action: "query",
        titles: "File:" + fileName,
        prop: "imageinfo",
        iiprop: "url",
        format: "json",
        origin: "*"
    };

    let url = baseUrl + "?" + new URLSearchParams(imageParams).toString();
    return fetch(url).then(function(res) {
        return res.json();
    }).then(function(data) {
        let pages = data.query.pages;
        let page = Object.values(pages)[0];
        return page.imageinfo[0].url;
    });
}

function extractBears(wikitext) {
    let speciesTables = wikitext.split('{{Species table/end}}');
    let bearPromises = [];

    speciesTables.forEach(function(table) {
        let rows = table.split('{{Species table/row');

        rows.forEach(function(row) {
            let nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
            let binomialMatch = row.match(/\|binomial=(.*?)\n/);
            let imageMatch = row.match(/\|image=(.*?)\n/);
            let rangeMatch = row.match(/\|range=(.*?)(?=\s*\|range-image=)/);

            if (nameMatch && binomialMatch && imageMatch && rangeMatch) {
                let fileName = imageMatch[1].trim().replace('File:', '');

                let bearPromise = fetchImageUrl(fileName).then(function(imageUrl) {
                    return {
                        name: nameMatch[1],
                        binomial: binomialMatch[1],
                        image: imageUrl,
                        range: rangeMatch[1].trim()
                    };
                });

                bearPromises.push(bearPromise);
            }
        });
    });

    Promise.all(bearPromises).then(function(bears) {
        let moreBears = document.querySelector('.more_bears');

        bears.forEach(function(bear) {
            let html = '<div class="bear">' +
                '<img src="' + bear.image + '" alt="Image of ' + bear.name + '" style="width:200px; height:auto;">' +
                '<p><b>' + bear.name + '</b> (' + bear.binomial + ')</p>' +
                '<p>Range: ' + bear.range + '</p>' +
                '</div>';

            moreBears.innerHTML += html;
        });
    });
}


export function initializeBears() {
    fetch(baseUrl + "?" + new URLSearchParams(params).toString())
        .then(function(res) { return res.json(); })
        .then(function(data) {
            extractBears(data.parse.wikitext['*']);
        });
}