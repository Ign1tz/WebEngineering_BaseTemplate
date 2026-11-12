export async function fetchApi(
    path: string,
    options?: RequestInit
): Promise<Response> {
    const response = await fetch(path, options);

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
