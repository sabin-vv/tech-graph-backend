import { createClient } from 'redis'

import { createGraphQLError, GQL_ERROR_CODES } from './errors/GraphQLError.js'

const REDIS_URL = process.env.REDIS_URL || ''

export const client = createClient({
    url: REDIS_URL,
})
client.on('error', (err) => console.error('Redis client error', err))

export const connectRedis = async () => {
    if (!client.isOpen) {
        await client.connect()
    }

    if (!client.isReady) {
        throw createGraphQLError(
            'OTP Verification Service is temporarily unavailable',
            GQL_ERROR_CODES.INTERNAL_SERVER_ERROR,
        )
    }

    console.log('Redis connected successfully')
    return client
}
