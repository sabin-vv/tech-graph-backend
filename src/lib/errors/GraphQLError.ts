import { GraphQLError } from 'graphql'

export const GQL_ERROR_CODES = {
    BAD_REQUEST: 'BAD_REQUEST',
    UNAUTHENTICATED: 'UNAUTHENTICATED',
    FORBIDDEN: 'FORBIDDEN',
    BAD_USER_INPUT: 'BAD_USER_INPUT',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const

export type GraphQLErrorCode = (typeof GQL_ERROR_CODES)[keyof typeof GQL_ERROR_CODES]

const STATUS_CODES: Record<GraphQLErrorCode, number> = {
    BAD_REQUEST: 400,
    UNAUTHENTICATED: 401,
    FORBIDDEN: 403,
    BAD_USER_INPUT: 400,
    INVALID_CREDENTIALS: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
}

export function createGraphQLError(message: string, code: GraphQLErrorCode): GraphQLError {
    return new GraphQLError(message, {
        extensions: {
            code,
            statusCode: STATUS_CODES[code],
        },
    })
}
