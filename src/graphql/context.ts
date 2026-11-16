import type { Request } from 'express'
import { verifyAuthToken } from '../lib/auth.js'
import { createGraphQLError, GQL_ERROR_CODES } from '../lib/errors/GraphQLError.js'
import { AppError } from '../lib/errors/AppError.js'

export interface Context {
    userId: string | null
}
export const createContext = async (req: Request): Promise<Context> => {
    const authorization = req.headers.authorization

    if (!authorization) {
        return { userId: null }
    }

    if (!authorization.startsWith('Bearer ')) {
        return { userId: null }
    }

    const token = authorization.slice(7).trim()

    if (!token) {
        return { userId: null }
    }

    try {
        const userId = verifyAuthToken(token)
        return { userId }
    } catch (error) {
        if (error instanceof AppError && error.statusCode >= 500) {
            console.error('Authentication service failure', {
                code: error.code,
                message: error.message,
            })
            throw error
        }

        console.warn('Authentication failed', {
            reason: error instanceof Error ? error.message : 'Unknown error',
        })

        return {
            userId: null,
        }
    }
}

export const requireAuth = (context: Context): string => {
    if (!context.userId) {
        throw createGraphQLError('Authentication required', GQL_ERROR_CODES.UNAUTHENTICATED)
    }

    return context.userId
}
