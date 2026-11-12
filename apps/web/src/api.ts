/// <reference types="vite/client" />

const apiOrigin = (import.meta.env.VITE_API_ORIGIN ?? '')
    .trim()
    .replace(/\/+$/, '');

export function apiUrl(path: string): string {
    return `${apiOrigin}${path}`;
}

export async function fetchApi(
    path: string,
    options?: RequestInit
): Promise<Response> {
    const response = await fetch(apiUrl(path), options);

    if (response.ok) {
        return response;
    }

    const contentType = response.headers.get('content-type') ?? '';
    let detail = `Request failed with HTTP ${response.status}.`;

    if (contentType.startsWith('application/problem+json')) {
        const problem: unknown = await response.json().catch(() => null);

        if (
            typeof problem === 'object' &&
            problem !== null &&
            'detail' in problem &&
            typeof problem.detail === 'string'
        ) {
            detail = problem.detail;
        }
    }

    throw new Error(detail);
}