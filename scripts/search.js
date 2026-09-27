export function initializeSearch() {
    const searchForm = document.querySelector('.search');

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();

        document.querySelectorAll('.highlight').forEach((el) => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        });

        const searchKey = event.currentTarget.elements.q.value.trim();
        if (!searchKey) return;

        const regex = new RegExp(
            '(' + searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')',
            'gi'
        );

        function walk(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const match = node.nodeValue.match(regex);

                if (match) {
                    const span = document.createElement('span');
                    span.innerHTML = node.nodeValue.replace(
                        regex,
                        '<mark class="highlight">$1</mark>'
                    );
                    node.replaceWith.apply(node, span.childNodes);
                }
            }
            else if (
                node.nodeType === Node.ELEMENT_NODE &&
                node.tagName !== 'SCRIPT' &&
                node.tagName !== 'STYLE' &&
                node.tagName !== 'FORM'
            ) {
                node.childNodes.forEach(walk);
            }
        }

        document.querySelectorAll('article').forEach((article) => {
            walk(article);
        });
    });
}