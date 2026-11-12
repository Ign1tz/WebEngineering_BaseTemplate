import { type JSX, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Bear } from '../../types/types';
import { fetchBears } from './BearAPI';

const placeholder = new URL('../../../media/placeholder.png', import.meta.url)
    .href;

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

export default function BearList({
                                     standalone = false,
                                 }: {
    standalone?: boolean;
}): JSX.Element {
    const [bears, setBears] = useState<Bear[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        async function load(): Promise<void> {
            try {
                const result = await fetchBears(controller.signal);

                if (!controller.signal.aborted) {
                    setBears(result);
                }
            } catch (failure) {
                if (!controller.signal.aborted) {
                    setError(
                        failure instanceof Error
                            ? failure.message
                            : 'Could not load bear data.'
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            controller.abort();
        };
    }, []);

    return (
        <section className="more_bears">
            {standalone ? <h1>Bears</h1> : <h2>More Bears</h2>}

            {loading && <p>Loading bears...</p>}
            {error !== '' && <p role="alert">{error}</p>}

            {!loading && error === '' && bears.length === 0 && (
                <p>No bears were found.</p>
            )}

            {!loading &&
                error === '' &&
                bears.map((bear) => <BearItem key={bear.id} bear={bear} />)}
        </section>
    );
}