import { type JSX, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Bear } from '../../types/types';
import Comments from '../comments/comments';

type DetailState =
    | { status: 'loading' }
    | { status: 'ready'; bear: Bear }
    | { status: 'not-found' }
    | { status: 'error' };

const placeholder = new URL('../../../media/placeholder.png', import.meta.url)
    .href;

function BearDetails({ bearId }: { bearId: string }): JSX.Element {
    const [state, setState] = useState<DetailState>({ status: 'loading' });

    useEffect(() => {
        const controller = new AbortController();

        async function load(): Promise<void> {
            try {
                const response = await fetch(
                    `/api/bears/${encodeURIComponent(bearId)}`,
                    { signal: controller.signal }
                );

                if (controller.signal.aborted) return;

                if (response.status === 404) {
                    setState({ status: 'not-found' });
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Bear request returned ${response.status}`);
                }

                const bear = (await response.json()) as Bear;

                if (!controller.signal.aborted) {
                    setState({ status: 'ready', bear });
                }
            } catch {
                if (!controller.signal.aborted) {
                    setState({ status: 'error' });
                }
            }
        }

        void load();

        return () => {
            controller.abort();
        };
    }, [bearId]);

    return (
        <main>
            <Link to="/bears">Back to bears</Link>

            {state.status === 'loading' && <p>Loading bear...</p>}
            {state.status === 'not-found' && <h1>Bear not found</h1>}
            {state.status === 'error' && (
                <p role="alert">Could not load bear details.</p>
            )}

            {state.status === 'ready' && (
                <article>
                    <h1>{state.bear.name}</h1>

                    <img
                        src={state.bear.image}
                        alt={`Image of ${state.bear.name}`}
                        width={300}
                        onError={({ currentTarget }) => {
                            if (currentTarget.src !== placeholder) {
                                currentTarget.src = placeholder;
                            }
                        }}
                    />

                    <p>Binomial name: {state.bear.binomial}</p>
                    <p>Range: {state.bear.range}</p>

                    <Comments bearId={state.bear.id} />
                </article>
            )}
        </main>
    );
}

export default function BearDetail(): JSX.Element {
    const { bearId } = useParams<'bearId'>();

    if (bearId === undefined) {
        return <Link to="/bears">Back to bears</Link>;
    }

    return <BearDetails key={bearId} bearId={bearId} />;
}
