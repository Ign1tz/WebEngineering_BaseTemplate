export function initializeSearch() {
    const searchForm = document.querySelector<HTMLFormElement>('.search')!;
    if (!searchForm) {
        console.error('Search form could not be found.');
        return;
    }
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();

        document.querySelectorAll('.highlight').forEach((el) => {
            const parent = el.parentNode;
            if (!parent) {
                console.error('Parent element could not be found.');
                return;
            }
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        });
        const queryElement = searchForm.elements.namedItem('q');
        if (!(queryElement instanceof HTMLInputElement)) {
            return;
        }

        const searchKey = queryElement.value.trim();
        if (!searchKey) return;

        const regex = new RegExp(
            '(' + searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')',
            'gi'
        );

        function walk(node: Node): void {
            if (node.nodeType === Node.TEXT_NODE) {
                const value = node.nodeValue;

                if (!value) {
                    return;
                }

                const match = value.match(regex);

                if (match) {
                    const span = document.createElement('span');

                    span.innerHTML = value.replace(
                        regex,
                        '<mark class="highlight">$1</mark>'
                    );

                    (node as ChildNode).replaceWith(...span.childNodes);
                }
            }
            else if (
                node.nodeType === Node.ELEMENT_NODE &&
                node instanceof Element &&
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