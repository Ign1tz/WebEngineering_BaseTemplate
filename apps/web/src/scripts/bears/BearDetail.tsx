import { type JSX, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Bear } from '../../types/types';
import Comments from '../comments/comments';
import { fetchBear } from './BearAPI';

type DetailState =
    | { status: 'loading' }
    | { status: 'ready'; bear: Bear }
    | { status: 'error'; detail: string };

const placeholder = new URL('../../../media/placeholder.png', import.meta.url)
    .href;

function BearDetails({ bearId }: { bearId: string }): JSX.Element {
    const [state, setState] = useState<DetailState>({ status: 'loading' });

    useEffect(() => {
        const controller = new AbortController();

        async function load(): Promise<void> {
            try {
                const bear = await fetchBear(bearId, controller.signal);

                if (!controller.signal.aborted) {
                    setState({ status: 'ready', bear });
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setState({
                        status: 'error',
                        detail:
                            error instanceof Error
                                ? error.message
                                : 'Could not load bear details.',
                    });
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
            {state.status === 'loading' && <p>Loading bear...</p>}
            {state.status === 'error' && <p role="alert">{state.detail}</p>}

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
        return <p>Bear not found.</p>;
    }

    return <BearDetails key={bearId} bearId={bearId} />;
}
