import { type FormEvent, type JSX, useState } from 'react';
import { fetchApi } from '../../api';

interface Comment {
    id: string;
    author: string;
    text: string;
}

interface CommentsProps {
    bearId?: string;
}

export default function Comments({ bearId = '' }: CommentsProps): JSX.Element {
    const [visible, setVisible] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [author, setAuthor] = useState('');
    const [text, setText] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);

    const id = bearId.trim();
    const url =
        id === ''
            ? '/api/comments'
            : `/api/bears/${encodeURIComponent(id)}/comments`;

    async function request(
        path: string,
        fallback: string,
        action: (response: Response) => Promise<void> | void,
        options?: RequestInit
    ): Promise<void> {
        setBusy(true);
        setError('');

        try {
            const response = await fetchApi(path, options);
            await action(response);
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : fallback);
        } finally {
            setBusy(false);
        }
    }

    function toggleComments(): void {
        setVisible(!visible);

        if (!visible) {
            void request(url, 'Could not load comments.', async (response) => {
                setComments((await response.json()) as Comment[]);
            });
        }
    }

    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        if (busy) return;

        const input = { author: author.trim(), text: text.trim() };

        if (input.author === '' || input.text === '') {
            setError('Enter your name and a comment.');
            return;
        }

        void request(
            url,
            'Could not post comment.',
            async (response) => {
                const comment = (await response.json()) as Comment;
                setComments((current) => [...current, comment]);
                setAuthor('');
                setText('');
            },
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            }
        );
    }

    function remove(commentId: string): void {
        void request(
            `/api/comments/${encodeURIComponent(commentId)}`,
            'Could not delete comment.',
            () => {
                setComments((current) =>
                    current.filter((comment) => comment.id !== commentId)
                );
            },
            { method: 'DELETE' }
        );
    }

    return (
        <section className="comments">
            <button
                className="show-hide"
                type="button"
                aria-expanded={visible}
                disabled={busy}
                onClick={toggleComments}
            >
                {visible ? 'Hide comments' : 'Show comments'}
            </button>

            {visible && (
                <div className="comment-wrapper">
                    <h3>Comments</h3>
                    {error !== '' && <p role="alert">{error}</p>}

                    <form className="comment-form" onSubmit={submit}>
                        <label>
                            Your name
                            <input
                                value={author}
                                maxLength={80}
                                required
                                disabled={busy}
                                onChange={(event) => {
                                    setAuthor(event.target.value);
                                }}
                            />
                        </label>

                        <label>
                            Your comment
                            <textarea
                                value={text}
                                maxLength={1000}
                                required
                                disabled={busy}
                                onChange={(event) => {
                                    setText(event.target.value);
                                }}
                            />
                        </label>

                        <button type="submit" disabled={busy}>
                            Submit comment
                        </button>
                    </form>

                    <ul className="comment-container">
                        {comments.map((comment) => (
                            <li key={comment.id}>
                                <p>{comment.author}</p>
                                <p>{comment.text}</p>
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => {
                                        remove(comment.id);
                                    }}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
