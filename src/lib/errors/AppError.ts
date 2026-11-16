export interface AppErrorOptions {
    statusCode: number
    code: string
}

export class AppError extends Error {
    public readonly statusCode: number
    public readonly code: string
    public readonly isOperational = true

    constructor(message: string, options: AppErrorOptions) {
        super(message)

        this.name = 'AppError'
        this.statusCode = options.statusCode
        this.code = options.code

        Object.setPrototypeOf(this, new.target.prototype)
        Error.captureStackTrace?.(this, this.constructor)
    }
}
