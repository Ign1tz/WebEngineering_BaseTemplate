export function initializeSearch() {
    document.querySelector('.search').addEventListener('submit', function(e) {
        e.preventDefault();

        document.querySelectorAll('.highlight').forEach(function(el) {
            let parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        });

        let searchKey = this.element.q.value.trim();
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
}