import { type JSX, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import type { Bear } from '../../types/types';
import { fetchBears } from './BearAPI';

const placeholder = new URL('../../../media/placeholder.png', import.meta.url).href;

function BearItem({ bear }: { bear: Bear }): JSX.Element {
    return (
        <div className="bear">
            <Link to={`/bears/${encodeURIComponent(bear.id)}`}>
                <img
                    src={bear.image}
                    alt={`Image of ${bear.name}`}
                    style={{ width: '200px', height: 'auto' }}
                    onError={({ currentTarget }) => {
                        if (currentTarget.src !== placeholder) {
                            currentTarget.src = placeholder;
                        }
                    }}
                />
                <p>
                    <strong>{bear.name}</strong> ({bear.binomial})
                </p>
            </Link>

            <p>Range: {bear.range}</p>
        </div>
    );
}

type LoadState =
    | { status: 'loading' }
    | { status: 'ready'; bears: Bear[] }
    | { status: 'error'; detail: string };

function BearResults({ query }: { query: string }): JSX.Element {
    const [state, setState] = useState<LoadState>({ status: 'loading' });

    useEffect(() => {
        const controller = new AbortController();

        async function load(): Promise<void> {
            try {
                const bears = await fetchBears(controller.signal, query);

                if (!controller.signal.aborted) {
                    setState({ status: 'ready', bears });
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setState({
                        status: 'error',
                        detail: error instanceof Error ? error.message : 'Could not load bear data.',
                    });
                }
            }
        }

        void load();
        return () => controller.abort();
    }, [query]);

    if (state.status === 'loading') {
        return <p>Loading bears...</p>;
    }

    if (state.status === 'error') {
        return <p role="alert">{state.detail}</p>;
    }

    if (state.bears.length === 0) {
        return <p>No bears were found.</p>;
    }

    return <>{state.bears.map((bear) => <BearItem key={bear.id} bear={bear} />)}</>;
}

export default function BearList({
                                     standalone = false,
                                     query = '',
                                 }: {
    standalone?: boolean;
    query?: string;
}): JSX.Element {
    return (
        <section className="more_bears">
            {standalone ? <h1>Bears</h1> : <h2>More Bears</h2>}
            <BearResults key={query} query={query} />
        </section>
    );
}