import type { ErrorRequestHandler } from 'express'
import { AppError } from '../errors/AppError.js'

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error)
    }

    const isOperationalError = error instanceof AppError

    const statusCode = isOperationalError ? error.statusCode : 500

    const code = isOperationalError ? error.code : 'INTERNAL_SERVER_ERROR'

    const message = isOperationalError ? error.message : 'Something went wrong. Please try again later.'

    if (!isOperationalError || statusCode >= 500) {
        console.error('[Express Error]', {
            method: req.method,
            path: req.originalUrl,
            statusCode,
            error,
        })
    }

    res.status(statusCode).json({
        errors: [
            {
                message,
                extensions: {
                    code,
                    statusCode,
                },
            },
        ],
    })
}
