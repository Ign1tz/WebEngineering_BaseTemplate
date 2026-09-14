document.querySelector('.search.js').addEventListener('submit', function(e) {
    e.preventDefault();

    document.querySelectorAll('.highlight').forEach(function(el) {
        let parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });

    let searchKey = this.q.value.trim();
    if (!searchKey) return;

    let regex = new RegExp('(' + searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');

    function walk(node) {
        if (node.nodeType === 3) { // Text node
            let match = node.nodeValue.match(regex);
            if (match) {
                let span = document.createElement('span');
                span.innerHTML = node.nodeValue.replace(regex, '<mark class="highlight">$1</mark>');
                node.replaceWith.apply(node, span.childNodes);
            }
        }
        else if (node.nodeType === 1 && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'FORM') {
            node.childNodes.forEach(walk);
        }
    }

    walk(document.body);
});


// Show/hide comments.js toggle
let showHideBtn = document.querySelector('.show-hide');
let commentWrapper = document.querySelector('.comment-wrapper');

commentWrapper.style.display = 'none';

showHideBtn.onclick = function() {
    let showHideText = showHideBtn.textContent;
    if (showHideText === 'Show comment') {
        showHideBtn.textContent = 'Hide comments.js';
        commentWrapper.style.display = 'block';
    } else {
        showHideBtn.textContent = 'Show comments.js';
        commentWrapper.style.display = 'none';
    }
};

// Comment form stuff
let form = document.querySelector('.comment-form');
let nameField = document.querySelector('#name');
let commentField = document.querySelector('#comment');
let list = document.querySelector('.comment-container');

form.onsubmit = function(e) {
    e.preventDefault();

    let listItem = document.createElement('li');
    let namePara = document.createElement('p');
    let commentPara = document.createElement('p');
    let nameValue = nameField.value;
    let commentValue = commentField.value;

    namePara.textContnet = nameValue;
    commentPara.textContent = commentValue;

    console.log(nameValue);

    list.appendChild(listItem);
    listItem.appendChild(namePara);
    listItem.appendChild(commentPara);

    nameField.value = '';
    commentField.value = '';
};

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
    let bears = [];
    speciesTables.forEach(function(table) {
        let rows = table.split('{{Species table/row');
        rows.forEach(function(row) {
            let nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
            let binomialMatch = row.match(/\|binomial=(.*?)\n/);
            let imageMatch = row.match(/\|image=(.*?)\n/);

            if (nameMatch && binomialMatch && imageMatch) {
                let fileName = imageMatch[1].trim().replace('File:', '');

                fetchImageUrl(fileName).then(function(imageUrl) {
                    let bear = {
                        name: nameMatch[1],
                        binomial: binomialMatch[1],
                        image: imageUrl,
                        range: "TODO extract correct range"
                    };
                    bears.push(bear);

                    if (bears.length === rows.length) {
                        let moreBears = document.querySelector('.more_bears');
                        bears.forEach(function(bear) {
                            let html = '<div class="bear">' +
                                '<img src="' + bear.image + '" alt="Image of ' + bear.name + '" style="width:200px; height:auto;">' +
                                '<p><b>' + bear.name + '</b> (' + bear.binomial + ')</p>' +
                                '<p>Range: ' + bear.range + '</p>' +
                                '</div>';
                            moreBears.innerHTML += html;
                        });
                    }
                });
            }
        });
    });
}

fetch(baseUrl + "?" + new URLSearchParams(params).toString())
    .then(function(res) { return res.json(); })
    .then(function(data) {
        extractBears(data.parse.wikitext['*']);
    });
