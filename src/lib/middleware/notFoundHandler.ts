import type { RequestHandler } from 'express'

import { HttpError } from '../errors/HttpError.js'

export const notFoundHandler: RequestHandler = (req, _res, next) => {
    next(new HttpError(404, `Route ${req.originalUrl} not found`, 'NOT_FOUND'))
}
