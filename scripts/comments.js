export function initializeComments() {
// Show/hide comments toggle
    let showHideBtn = document.querySelector('.show-hide');
    let commentWrapper = document.querySelector('.comment-wrapper');

    commentWrapper.style.display = 'none';

    showHideBtn.addEventListener('click', function () {
        let showHideText = showHideBtn.textContent;
        if (showHideText === 'Show comments') {
            showHideBtn.textContent = 'Hide comments';
            commentWrapper.style.display = 'block';
        } else {
            showHideBtn.textContent = 'Show comments';
            commentWrapper.style.display = 'none';
        }})

// Comment form stuff
    let form = document.querySelector('.comment-form');
    let nameField = form.elements.name;
    let commentField = form.elements.comment;
    let list = document.querySelector('.comment-container');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        let listItem = document.createElement('li');
        let namePara = document.createElement('p');
        let commentPara = document.createElement('p');
        let nameValue = nameField.value;
        let commentValue = commentField.value;

        namePara.textContent = nameValue;
        commentPara.textContent = commentValue;

        console.log(nameValue);

        list.appendChild(listItem);
        listItem.appendChild(namePara);
        listItem.appendChild(commentPara);

        nameField.value = '';
        commentField.value = '';
    })
}