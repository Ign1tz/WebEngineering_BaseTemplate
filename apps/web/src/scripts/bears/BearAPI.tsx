import type { Bear } from '../../types/types';

export async function fetchBears(): Promise<Bear[]> {
    const response = await fetch('/api/bears');

    if (!response.ok) {
        throw new Error(`Bear API returned HTTP ${response.status}`);
    }

    return await (response.json() as Promise<Bear[]>);
}
