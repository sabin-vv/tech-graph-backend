import type { GraphQLFormattedError } from 'graphql'

const CLIENT_SAFE_ERROR_CODES = new Set([
    'BAD_REQUEST',
    'BAD_USER_INPUT',
    'CONFLICT',
    'FORBIDDEN',
    'GRAPHQL_VALIDATION_FAILED',
    'INVALID_CREDENTIALS',
    'NOT_FOUND',
    'TOO_MANY_REQUESTS',
    'UNAUTHENTICATED',
])

function logGraphQLError(error: unknown): void {
    const errorDetails = error instanceof Error
        ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
          }
        : {
              value: error,
          }

    console.error(
        JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'error',
            event: 'graphql.error',
            ...errorDetails,
        }),
    )
}

function withoutStacktrace(formattedError: GraphQLFormattedError): GraphQLFormattedError {
    const { stacktrace: _stacktrace, ...extensions } = formattedError.extensions ?? {}

    return {
        ...formattedError,
        extensions,
    }
}

export function formatGraphQLError(formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError {
    const code = typeof formattedError.extensions?.code === 'string' ? formattedError.extensions.code : undefined

    if (code && CLIENT_SAFE_ERROR_CODES.has(code)) {
        return withoutStacktrace(formattedError)
    }

    logGraphQLError(error)

    return {
        message: 'Something went wrong. Please try again later.',
        extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            statusCode: 500,
        },
    }
}
