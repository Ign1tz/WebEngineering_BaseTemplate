import {FormEvent, JSX, useState} from 'react';

interface Comment {
    id: number;
    name: string;
    text: string;
}

function Comments(): JSX.Element {
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [name, setName] = useState('');
    const [commentText, setCommentText] = useState('');

    const [comments, setComments] = useState<Comment[]>([
        {
            id: 1,
            name: 'Bob Fossil',
            text: 'Oh I am so glad you taught me all about the big brown angry guys...',
        },
    ]);

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        const trimmedName = name.trim();
        const trimmedComment = commentText.trim();

        if (trimmedName === '' || trimmedComment === '') {
            alert('Please fill in both name and comment fields.');
            return;
        }

        const newComment: Comment = {
            id: Date.now(),
            name: trimmedName,
            text: trimmedComment,
        };

        setComments((currentComments) => [...currentComments, newComment]);

        setName('');
        setCommentText('');
    }

    return (
        <section className="comments">
        <button
            className="show-hide"
    type="button"
    onClick={() => {
        setCommentsVisible((visible) => !visible);
    }}
>
    {commentsVisible ? 'Hide comments' : 'Show comments'}
    </button>

    {commentsVisible && (
        <div className="comment-wrapper">
            <h1>Add comment</h1>

    <form className="comment-form" onSubmit={handleSubmit}>
    <div className="flex-pair">
    <label htmlFor="name">Your name:</label>

    <input
        type="text"
        name="name"
        id="name"
        placeholder="Enter your name"
        value={name}
        onChange={(event) => {
        setName(event.target.value);
    }}
        />
        </div>

        <div className="flex-pair">
    <label htmlFor="comment">Your comment:</label>

    <input
        type="text"
        name="comment"
        id="comment"
        placeholder="Enter your comment"
        value={commentText}
        onChange={(event) => {
        setCommentText(event.target.value);
    }}
        />
        </div>

        <div>
        <input type="submit" value="Submit comment" />
        </div>
        </form>

        <h1>Comments</h1>

        <ul className="comment-container">
        {comments.map((comment) => (
                <li key={comment.id}>
                    <p>{comment.name}</p>
                    <p>{comment.text}</p>
                    </li>
            ))}
        </ul>
        </div>
    )}
    </section>
);
}

export default Comments;