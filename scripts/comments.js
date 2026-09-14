export function initializeComments() {
// Show/hide comments toggle
    const showHideBtn = document.querySelector('.show-hide');
    const commentWrapper = document.querySelector('.comment-wrapper');

    let commentsVisible = false;

    function updateCommentVisibility() {
        commentWrapper.style.display = commentsVisible ? 'block' : 'none';
        showHideBtn.textContent = commentsVisible ? 'Hide comments' : 'Show comments';
    }
    updateCommentVisibility();

    showHideBtn.addEventListener('click', () => {
        commentsVisible = !commentsVisible;
        updateCommentVisibility();
    });

// Comment form stuff
    const form = document.querySelector('.comment-form');
    const nameField = form.elements.name;
    const commentField = form.elements.comment;
    const list = document.querySelector('.comment-container');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

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