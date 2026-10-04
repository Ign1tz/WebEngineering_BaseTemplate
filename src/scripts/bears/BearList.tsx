import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { Bear } from '../../types/types';
import { useBears } from './useBears';

interface BearItemProps {
    bear: Bear;
}

function BearItem({ bear }: BearItemProps): ReactElement {
    return (
        <div className="bear">
            <Link to={`/bears/${bear.id}`}>
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
            </Link>

            <p>Range: {bear.range}</p>
        </div>
    );
}

function BearList(): ReactElement {
    const { state, retry } = useBears();

    return (
        <section className="more_bears">
            <h2>More Bears</h2>

            {state.status === 'loading' && <p>Loading bears...</p>}

            {state.status === 'empty' && <p>No bears were found.</p>}

            {state.status === 'error' && (
                <>
                    <p>{state.message}</p>

                    <button type="button" onClick={retry}>
                        Try again
                    </button>
                </>
            )}

            {state.status === 'success' &&
                state.bears.map((bear) => (
                    <BearItem key={bear.id} bear={bear} />
                ))}
        </section>
    );
}

export default BearList;
