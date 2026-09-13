document.querySelector('.search.js').addEventListener('submit', function(e) {
    e.preventDefault();

    document.querySelectorAll('.highlight').forEach(function(el) {
        var parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });

    var searchKey = this.q.value.trim();
    if (!searchKey) return;

    var regex = new RegExp('(' + searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');

    function walk(node) {
        if (node.nodeType === 3) { // Text node
            var match = node.nodeValue.match(regex);
            if (match) {
                var span = document.createElement('span');
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
var showHideBtn = document.querySelector('.show-hide');
var commentWrapper = document.querySelector('.comment-wrapper');

commentWrapper.style.display = 'none';

showHideBtn.onclick = function() {
    var showHideText = showHideBtn.textContent;
    if (showHideText === 'Show comment') {
        showHideBtn.textContent = 'Hide comments.js';
        commentWrapper.style.display = 'block';
    } else {
        showHideBtn.textContent = 'Show comments.js';
        commentWrapper.style.display = 'none';
    }
};

// Comment form stuff
var form = document.querySelector('.comment-form');
var nameField = document.querySelector('#name');
var commentField = document.querySelector('#comment');
var list = document.querySelector('.comment-container');

form.onsubmit = function(e) {
    e.preventDefault();

    var listItem = document.createElement('li');
    var namePara = document.createElement('p');
    var commentPara = document.createElement('p');
    var nameValue = nameField.value;
    var commentValue = commentField.value;

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
var baseUrl = "https://en.wikipedia.org/w/api.php";
var title = "List_of_ursids";

var params = {
    action: "parse",
    page: title,
    prop: "wikitext",
    section: 3,
    format: "json",
    origin: "*"
};

function fetchImageUrl(fileName) {
    var imageParams = {
        action: "query",
        titles: "File:" + fileName,
        prop: "imageinfo",
        iiprop: "url",
        format: "json",
        origin: "*"
    };

    var url = baseUrl + "?" + new URLSearchParams(imageParams).toString();
    return fetch(url).then(function(res) {
        return res.json();
    }).then(function(data) {
        var pages = data.query.pages;
        var page = Object.values(pages)[0];
        return page.imageinfo[0].url;
    });
}

function extractBears(wikitext) {
    var speciesTables = wikitext.split('{{Species table/end}}');
    var bears = [];
    speciesTables.forEach(function(table) {
        var rows = table.split('{{Species table/row');
        rows.forEach(function(row) {
            var nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
            var binomialMatch = row.match(/\|binomial=(.*?)\n/);
            var imageMatch = row.match(/\|image=(.*?)\n/);

            if (nameMatch && binomialMatch && imageMatch) {
                var fileName = imageMatch[1].trim().replace('File:', '');

                fetchImageUrl(fileName).then(function(imageUrl) {
                    var bear = {
                        name: nameMatch[1],
                        binomial: binomialMatch[1],
                        image: imageUrl,
                        range: "TODO extract correct range"
                    };
                    bears.push(bear);

                    if (bears.length === rows.length) {
                        var moreBears = document.querySelector('.more_bears');
                        bears.forEach(function(bear) {
                            var html = '<div class="bear">' +
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
