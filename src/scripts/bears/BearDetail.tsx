import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBears } from './useBears';

function BearDetail(): ReactElement {
    const { bearId } = useParams<{
        bearId: string;
    }>();

    const { state, retry } = useBears();

    if (state.status === 'loading') {
        return (
            <main>
                <p>Loading bear...</p>
            </main>
        );
    }

    if (state.status === 'error') {
        return (
            <main>
                <p>{state.message}</p>

                <button type="button" onClick={retry}>
                    Try again
                </button>

                <p>
                    <Link to="/bears">Back to bears</Link>
                </p>
            </main>
        );
    }

    if (state.status === 'empty') {
        return (
            <main>
                <p>No bears were found.</p>

                <Link to="/bears">Back to bears</Link>
            </main>
        );
    }

    const bear = state.bears.find((candidate) => candidate.id === bearId);

    if (bear === undefined) {
        return (
            <main>
                <h1>Bear not found</h1>

                <p>No bear exists with the identifier "{bearId}".</p>

                <Link to="/bears">Back to bears</Link>
            </main>
        );
    }

    return (
        <main>
            <article>
                <p>
                    <Link to="/bears">← Back to bears</Link>
                </p>

                <h1>{bear.name}</h1>

                <img
                    src={bear.image}
                    alt={`Image of ${bear.name}`}
                    style={{
                        width: '300px',
                        height: 'auto',
                    }}
                />

                <p>
                    <strong>Binomial name:</strong> {bear.binomial}
                </p>

                <p>
                    <strong>Range:</strong> {bear.range}
                </p>
            </article>
        </main>
    );
}

export default BearDetail;
