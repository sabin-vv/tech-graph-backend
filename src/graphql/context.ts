import type { Request } from 'express'
import { verifyAuthToken } from '../lib/auth.js'

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

    const token = authorization.slice(7)

    try {
        const userId = verifyAuthToken(token)
        return { userId }
    } catch {
        return {
            userId: null,
        }
    }
}

export const requireAuth = (context: Context): string => {
    if (!context.userId) {
        throw new Error('Authentication Required')
    }

    return context.userId
}
