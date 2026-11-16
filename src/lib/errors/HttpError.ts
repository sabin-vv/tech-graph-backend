import { AppError } from './AppError.js'

const STATUS_CODES: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHENTICATED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    408: 'REQUEST_TIMEOUT',
    409: 'CONFLICT',
    422: 'BAD_USER_INPUT',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
}

export class HttpError extends AppError {
    constructor(statusCode: number, message: string, code: string = STATUS_CODES[statusCode] ?? 'HTTP_ERROR') {
        super(message, {
            statusCode,
            code,
        })

        this.name = 'HttpError'
    }
}
