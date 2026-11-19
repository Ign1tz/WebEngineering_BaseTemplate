import { type FormEvent, type JSX, useState } from 'react';

import { fetchApi } from '../../api';

interface Comment {
    id: string;
    author: string;
    text: string;
}

interface CommentPage {
    items: Comment[];
    nextCursor: string | null;
}

interface CommentsProps {
    bearId?: string;
}

export default function Comments({ bearId = '' }: CommentsProps): JSX.Element {
    return <CommentSection key={bearId} bearId={bearId.trim()} />;
}

function CommentSection({ bearId }: { bearId: string }): JSX.Element {
    const [visible, setVisible] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [author, setAuthor] = useState('');
    const [text, setText] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    const url = bearId
        ? `/api/bears/${encodeURIComponent(bearId)}/comments`
        : '/api/comments';

    async function request(
        path: string,
        fallback: string,
        action: (response: Response) => Promise<void> | void,
        options?: RequestInit,
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

    async function loadComments(cursor?: string): Promise<void> {
        const params = new URLSearchParams({ limit: '20' });

        if (cursor) {
            params.set('cursor', cursor);
        }

        const path = bearId ? `${url}?${params}` : url;

        await request(path, 'Could not load comments.', async (response) => {
            if (!bearId) {
                setComments((await response.json()) as Comment[]);
                return;
            }

            const page = (await response.json()) as CommentPage;
            setComments((current) => cursor ? [...current, ...page.items] : page.items);
            setNextCursor(page.nextCursor);
        });
    }

    function toggleComments(): void {
        setVisible(!visible);

        if (!visible) {
            setComments([]);
            setNextCursor(null);
            void loadComments();
        }
    }

    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (busy) {
            return;
        }

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

                // Older pages are loaded first. A new comment appears on a later page.
                if (nextCursor === null) {
                    setComments((current) => [...current, comment]);
                }

                setAuthor('');
                setText('');
            },
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            },
        );
    }

    function remove(commentId: string): void {
        void request(
            `/api/comments/${encodeURIComponent(commentId)}`,
            'Could not delete comment.',
            () => {
                setComments((current) => current.filter((comment) => comment.id !== commentId));
            },
            { method: 'DELETE' },
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
                                onChange={(event) => setAuthor(event.target.value)}
                            />
                        </label>

                        <label>
                            Your comment
                            <textarea
                                value={text}
                                maxLength={1000}
                                required
                                disabled={busy}
                                onChange={(event) => setText(event.target.value)}
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
                                    onClick={() => remove(comment.id)}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>

                    {nextCursor !== null && (
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => void loadComments(nextCursor)}
                        >
                            Load more
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}