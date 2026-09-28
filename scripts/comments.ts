export function initializeComments(): void {
    const showHideBtn =
        document.querySelector<HTMLElement>('.show-hide');

    const commentWrapper =
        document.querySelector<HTMLElement>('.comment-wrapper');

    const form =
        document.querySelector<HTMLFormElement>('.comment-form');

    const list =
        document.querySelector<HTMLUListElement>('.comment-container');

    if (!form || !list || !showHideBtn || !commentWrapper) {
        console.error('Required comment elements could not be found.');
        return;
    }

    const nameField = form.elements.namedItem('name');
    const commentField = form.elements.namedItem('comment');

    if (
        !(nameField instanceof HTMLInputElement) ||
        !(commentField instanceof HTMLInputElement)
    ) {
        console.error('Comment form fields could not be found.');
        return;
    }

    let commentsVisible = false;

    function updateCommentVisibility(): void {
        commentWrapper.style.display =
            commentsVisible ? 'block' : 'none';

        showHideBtn.textContent =
            commentsVisible ? 'Hide comments' : 'Show comments';
    }

    updateCommentVisibility();

    showHideBtn.addEventListener('click', () => {
        commentsVisible = !commentsVisible;
        updateCommentVisibility();
    });

    form.addEventListener('submit', (event: SubmitEvent) => {
        event.preventDefault();

        if (
            !nameField.value.trim() ||
            !commentField.value.trim()
        ) {
            alert('Please fill in both name and comment fields.');
            return;
        }

        const listItem = document.createElement('li');
        const namePara = document.createElement('p');
        const commentPara = document.createElement('p');

        namePara.textContent = nameField.value;
        commentPara.textContent = commentField.value;

        listItem.append(namePara, commentPara);
        list.appendChild(listItem);

        form.reset();
    });
}