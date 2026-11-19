import { apiUrl, fetchApi } from '../../api';
import type { Bear } from '../../types/types';

function resolveImage(bear: Bear): Bear {
    return { ...bear, image: apiUrl(bear.image) };
}

export async function fetchBears(
    signal?: AbortSignal,
    query = '',
): Promise<Bear[]> {
    const params = new URLSearchParams({ q: query });
    const response = await fetchApi(`/api/bears?${params}`, { signal });
    const bears = (await response.json()) as Bear[];

    return bears.map(resolveImage);
}

export async function fetchBear(
    bearId: string,
    signal?: AbortSignal,
): Promise<Bear> {
    const response = await fetchApi(
        `/api/bears/${encodeURIComponent(bearId)}`,
        { signal },
    );

    return resolveImage((await response.json()) as Bear);
}