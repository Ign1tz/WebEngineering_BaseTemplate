import { fetchApi } from '../../api';
import type { Bear } from '../../types/types';

export async function fetchBears(signal?: AbortSignal): Promise<Bear[]> {
    const response = await fetchApi('/api/bears', { signal });
    return (await response.json()) as Bear[];
}

export async function fetchBear(
    bearId: string,
    signal?: AbortSignal
): Promise<Bear> {
    const response = await fetchApi(
        `/api/bears/${encodeURIComponent(bearId)}`,
        { signal }
    );

    return (await response.json()) as Bear;
}
