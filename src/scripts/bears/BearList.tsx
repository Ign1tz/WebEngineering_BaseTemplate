import {JSX, useEffect, useState} from 'react';
import type { Bear } from '../../types/types';
import { fetchBears } from './BearAPI';

interface BearItemProps {
    bear: Bear;
}

function BearItem({ bear }: BearItemProps): JSX.Element {
    return (
        <div className="bear">
            <img
                src={bear.image}
                alt={`Image of ${bear.name}`}
                style={{
                    width: '200px',
                    height: 'auto',
                }}
            />

            <p>
                <strong>{bear.name}</strong> ({bear.binomial})
            </p>

            <p>Range: {bear.range}</p>
        </div>
    );
}

function BearList(): JSX.Element {
    const [bears, setBears] = useState<Bear[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function loadBears(): Promise<void> {
            try {
                const loadedBears = await fetchBears();
                setBears(loadedBears);
            } catch (fetchError) {
                console.error('Error fetching bear data:', fetchError);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        void loadBears();
    }, []);

    return (
        <section className="more_bears">
            <h2>More Bears</h2>

            {loading && <p>Loading bears...</p>}

            {error && <p>Could not load bear data.</p>}

            {!loading &&
                !error &&
                bears.map((bear) => (
                    <BearItem key={bear.binomial} bear={bear} />
                ))}
        </section>
    );
}

export default BearList;