import type { FastifyInstance } from 'fastify';

interface FieldError {
    field: string;
    message: string;
}

class ApiError extends Error {
    constructor(
        readonly status: number,
        readonly title: string,
        detail: string,
        readonly errors?: FieldError[],
        cause?: unknown
    ) {
        super(detail, { cause });
        this.name = new.target.name;
    }
}

export class ValidationError extends ApiError {
    constructor(detail: string, errors: FieldError[]) {
        super(400, 'Bad Request', detail, errors);
    }
}

export class NotFoundError extends ApiError {
    constructor(detail: string) {
        super(404, 'Not Found', detail);
    }
}

export class UpstreamError extends ApiError {
    constructor(cause: unknown) {
        const timedOut =
            cause instanceof Error && cause.name === 'TimeoutError';

        super(
            timedOut ? 504 : 502,
            timedOut ? 'Gateway Timeout' : 'Bad Gateway',
            timedOut
                ? 'Wikimedia took too long to respond.'
                : 'Could not load Wikimedia data.',
            undefined,
            cause
        );
    }
}

export function registerErrorHandling(app: FastifyInstance): void {
    app.addHook('onRequest', async (request, reply) => {
        reply.header('x-request-id', request.id);
    });

    app.setNotFoundHandler(async () => {
        throw new NotFoundError('The requested route does not exist.');
    });

    app.setErrorHandler((error, request, reply) => {
        const statusCode =
            error instanceof Error &&
            'statusCode' in error &&
            typeof error.statusCode === 'number'
                ? error.statusCode
                : undefined;

        let problem: ApiError;

        if (error instanceof ApiError) {
            problem = error;
        } else if (statusCode === 400) {
            problem = new ValidationError('The request is invalid.', [
                {
                    field: 'request',
                    message: 'Check the request syntax and body.',
                },
            ]);
        } else if (
            statusCode !== undefined &&
            statusCode >= 400 &&
            statusCode < 500
        ) {
            const titles: Record<number, string> = {
                404: 'Not Found',
                413: 'Content Too Large',
                415: 'Unsupported Media Type',
            };

            problem = new ApiError(
                statusCode,
                titles[statusCode] ?? 'Request Rejected',
                'The server could not accept this request.'
            );
        } else {
            problem = new ApiError(
                500,
                'Internal Server Error',
                'An unexpected server error occurred.'
            );
        }

        const log = {
            requestId: request.id,
            status: problem.status,
            err: error,
        };

        if (problem.status >= 500) {
            request.log.error(log, 'Request failed');
        } else {
            request.log.warn(log, 'Request rejected');
        }

        return reply
            .code(problem.status)
            .header('x-request-id', request.id)
            .type('application/problem+json')
            .send({
                type: 'about:blank',
                title: problem.title,
                status: problem.status,
                detail: problem.message,
                instance: `/problems/${encodeURIComponent(request.id)}`,
                ...(problem.errors === undefined
                    ? {}
                    : { errors: problem.errors }),
            });
    });
}
