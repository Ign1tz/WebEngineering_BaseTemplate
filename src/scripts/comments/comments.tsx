import {
    useState,
    type FormEvent,
    type ReactElement,
} from 'react';
import HighlightedText from '../search/HighlightedText';

interface Comment {
    id: string;
    name: string;
    text: string;
}

interface CommentsProps {
    searchTerm: string;
}

const initialComments: Comment[] = [
    {
        id: 'bob-fossil-initial-comment',
        name: 'Bob Fossil',
        text: 'Oh I am so glad you taught me all about the big brown angry guys...',
    },
];

function Comments({ searchTerm }: CommentsProps): ReactElement {
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [name, setName] = useState('');
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] =
        useState<Comment[]>(initialComments);

    const buttonText = commentsVisible
        ? 'Hide comments'
        : 'Show comments';

    const isFormValid =
        name.trim() !== '' && commentText.trim() !== '';

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (!isFormValid) {
            alert('Please fill in both name and comment fields.');
            return;
        }

        const newComment: Comment = {
            id: crypto.randomUUID(),
            name: name.trim(),
            text: commentText.trim(),
        };

        setComments((currentComments) => [
            ...currentComments,
            newComment,
        ]);

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
                {buttonText}
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
                                <p>
                                    <HighlightedText
                                        text={comment.name}
                                        searchTerm={searchTerm}
                                    />
                                </p>

                                <p>
                                    <HighlightedText
                                        text={comment.text}
                                        searchTerm={searchTerm}
                                    />
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}

export default Comments;