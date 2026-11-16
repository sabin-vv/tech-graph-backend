import jwt, { type JwtPayload } from 'jsonwebtoken'

import { AppError } from './errors/AppError.js'

const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET

    if (!secret) {
        throw new AppError('Authentication service is not configured', {
            statusCode: 500,
            code: 'INTERNAL_SERVER_ERROR',
        })
    }

    return secret
}

export const createAuthToken = (userId: string) => {
    return jwt.sign({ userId }, getJwtSecret(), {
        expiresIn: '7d',
    })
}

export const verifyAuthToken = (token: string): string => {
    const secret = getJwtSecret()

    let payload: JwtPayload & { userId?: string }
    try {
        payload = jwt.verify(token, secret) as JwtPayload & {
            userId?: string
        }
    } catch {
        throw new AppError('Invalid auth token', {
            statusCode: 401,
            code: 'UNAUTHENTICATED',
        })
    }

    if (!payload.userId) {
        throw new AppError('Invalid auth token', {
            statusCode: 401,
            code: 'UNAUTHENTICATED',
        })
    }

    return payload.userId
}
