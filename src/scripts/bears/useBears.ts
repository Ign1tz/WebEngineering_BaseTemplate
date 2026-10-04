import { useCallback, useEffect, useRef, useState } from 'react';
import type { Bear } from '../../types/types';
import { fetchBears } from './BearAPI';

export type BearState =
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

interface UseBearsResult {
    state: BearState;
    retry: () => void;
}

export function useBears(): UseBearsResult {
    const [state, setState] = useState<BearState>({
        status: 'loading',
    });

    const [requestVersion, setRequestVersion] = useState(0);

    const latestRequestId = useRef(0);

    const retry = useCallback((): void => {
        setRequestVersion((currentVersion) => currentVersion + 1);
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        latestRequestId.current += 1;
        const requestId = latestRequestId.current;

        setState({
            status: 'loading',
        });

        async function loadBears(): Promise<void> {
            try {
                const bears = await fetchBears(controller.signal);

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

                console.error('Error fetching bear data:', error);

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

    return {
        state,
        retry,
    };
}
