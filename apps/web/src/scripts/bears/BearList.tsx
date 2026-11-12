import { type JSX, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Bear } from '../../types/types';
import { fetchBears } from './BearAPI';

interface BearItemProps {
    bear: Bear;
}

interface BearListProps {
    search?: string;
    standalone?: boolean;
}

const placeholder = new URL('../../../media/placeholder.png', import.meta.url)
    .href;

function BearItem({ bear }: BearItemProps): JSX.Element {
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
    search = '',
    standalone = false,
}: BearListProps): JSX.Element {
    const [bears, setBears] = useState<Bear[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadBears(): Promise<void> {
            try {
                const loadedBears = await fetchBears();
                if (active) setBears(loadedBears);
            } catch {
                if (active) setError(true);
            } finally {
                if (active) setLoading(false);
            }
        }

        void loadBears();

        return () => {
            active = false;
        };
    }, []);

    const query = search.trim().toLowerCase();
    const visibleBears = bears.filter((bear) =>
        `${bear.name} ${bear.binomial} ${bear.range}`
            .toLowerCase()
            .includes(query)
    );

    return (
        <section className="more_bears">
            {!standalone && (
                <>
                    <h2>More Bears</h2>
                    <Link to="/bears">Browse bears</Link>
                </>
            )}

            {loading && <p>Loading bears...</p>}
            {error && <p role="alert">Could not load bear data.</p>}

            {!loading && !error && visibleBears.length === 0 && (
                <p>No bears match your search.</p>
            )}

            {!loading &&
                !error &&
                visibleBears.map((bear) => (
                    <BearItem key={bear.id} bear={bear} />
                ))}
        </section>
    );
}
