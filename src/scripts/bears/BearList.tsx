import {
    useEffect,
    useRef,
    useState,
    type ReactElement,
} from 'react';
import type { Bear } from '../../types/types';
import { fetchBears } from './BearAPI';

interface BearItemProps {
    bear: Bear;
}

type BearState =
    | {
    status: 'loading';
}
    | {
    status: 'success';
    bears: Bear[];
}
    | {
    status: 'empty';
}
    | {
    status: 'error';
    message: string;
};

function BearItem({
                      bear,
                  }: BearItemProps): ReactElement {
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

function BearList(): ReactElement {
    const [state, setState] = useState<BearState>({
        status: 'loading',
    });

    const [requestVersion, setRequestVersion] =
        useState(0);

    const latestRequestId = useRef(0);

    useEffect(() => {
        const controller = new AbortController();

        latestRequestId.current += 1;

        const requestId = latestRequestId.current;

        setState({
            status: 'loading',
        });

        async function loadBears(): Promise<void> {
            try {
                const bears = await fetchBears(
                    controller.signal
                );

                if (
                    controller.signal.aborted ||
                    requestId !== latestRequestId.current
                ) {
                    return;
                }

                if (bears.length === 0) {
                    setState({
                        status: 'empty',
                    });

                    return;
                }

                setState({
                    status: 'success',
                    bears,
                });
            } catch (error) {
                if (
                    controller.signal.aborted ||
                    requestId !== latestRequestId.current
                ) {
                    return;
                }

                console.error(
                    'Error fetching bear data:',
                    error
                );

                setState({
                    status: 'error',
                    message: 'Could not load bear data.',
                });
            }
        }

        void loadBears();

        return () => {
            controller.abort();
        };
    }, [requestVersion]);

    function retry(): void {
        setRequestVersion(
            (currentVersion) => currentVersion + 1
        );
    }

    return (
        <section className="more_bears">
            <h2>More Bears</h2>

            {state.status === 'loading' && (
                <p>Loading bears...</p>
            )}

            {state.status === 'empty' && (
                <p>No bears were found.</p>
            )}

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
                    <BearItem
                        key={bear.binomial}
                        bear={bear}
                    />
                ))}
        </section>
    );
}

export default BearList;