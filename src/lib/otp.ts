import { createHash, randomInt, randomUUID, timingSafeEqual } from 'node:crypto'

import { client } from './redis.js'
import { sendSignupOtpEmail } from './email.js'
import { createGraphQLError, GQL_ERROR_CODES } from './errors/GraphQLError.js'

const OTP_TTL_SECONDS = 5 * 60
const VERIFIED_TTL_SECONDS = 10 * 60
const RESEND_COOLDOWN_SECONDS = 60
const MAX_ATTEMPTS = 5

interface StoredOtp {
    email: string
    otpHash: string
    attempts: number
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase()

const hashOtp = (email: string, otp: string): string =>
    createHash('sha256')
        .update(`${process.env.OTP_SECRET ?? process.env.JWT_SECRET ?? 'techgraph-otp'}:${email}:${otp}`)
        .digest('hex')

const getOtpKey = (challengeId: string): string => `otp:signup:${challengeId}`
const getRateKey = (email: string): string => `otp:signup:rate:${email}`
const getVerifiedKey = (verificationToken: string): string => `otp:signup:verified:${verificationToken}`

export const createSignupOtp = async (rawEmail: string) => {
    const email = normalizeEmail(rawEmail)
    if (!email || !email.includes('@')) {
        throw createGraphQLError('A valid email is required', GQL_ERROR_CODES.BAD_USER_INPUT)
    }

    const rateKey = getRateKey(email)
    const rateLimit = await client.set(rateKey, '1', {
        NX: true,
        EX: RESEND_COOLDOWN_SECONDS,
    })

    if (rateLimit !== 'OK') {
        throw createGraphQLError('Please wait before requesting another code', GQL_ERROR_CODES.BAD_USER_INPUT)
    }

    const otp = randomInt(100000, 1000000).toString()
    const challengeId = randomUUID()
    const storedOtp: StoredOtp = {
        email,
        otpHash: hashOtp(email, otp),
        attempts: 0,
    }

    await client.set(getOtpKey(challengeId), JSON.stringify(storedOtp), {
        EX: OTP_TTL_SECONDS,
    })

    try {
        await sendSignupOtpEmail(email, otp)
    } catch (error) {
        await client.del(getOtpKey(challengeId))
        await client.del(rateKey)
        throw error
    }

    return { challengeId, expiresIn: OTP_TTL_SECONDS }
}

export const verifySignupOtp = async (rawEmail: string, challengeId: string, otp: string) => {
    const email = normalizeEmail(rawEmail)
    const key = getOtpKey(challengeId)
    const rawStoredOtp = await client.get(key)

    if (!rawStoredOtp) {
        throw createGraphQLError('This verification code has expired', GQL_ERROR_CODES.BAD_USER_INPUT)
    }

    let storedOtp: StoredOtp
    try {
        storedOtp = JSON.parse(rawStoredOtp) as StoredOtp
    } catch {
        await client.del(key)
        throw createGraphQLError('Invalid verification request', GQL_ERROR_CODES.BAD_USER_INPUT)
    }

    if (storedOtp.email !== email) {
        throw createGraphQLError('Invalid verification request', GQL_ERROR_CODES.BAD_USER_INPUT)
    }

    if (!/^\d{6}$/.test(otp)) {
        throw createGraphQLError('Enter the six-digit verification code', GQL_ERROR_CODES.BAD_USER_INPUT)
    }

    const expectedHash = Buffer.from(storedOtp.otpHash, 'hex')
    const actualHash = Buffer.from(hashOtp(email, otp), 'hex')
    const matches = expectedHash.length === actualHash.length && timingSafeEqual(expectedHash, actualHash)

    if (!matches) {
        const attempts = storedOtp.attempts + 1
        if (attempts >= MAX_ATTEMPTS) {
            await client.del(key)
            throw createGraphQLError('Too many invalid attempts. Request a new code.', GQL_ERROR_CODES.BAD_USER_INPUT)
        }

        const ttl = await client.ttl(key)
        await client.set(key, JSON.stringify({ ...storedOtp, attempts }), {
            EX: Math.max(1, ttl),
        })
        throw createGraphQLError('Invalid verification code', GQL_ERROR_CODES.BAD_USER_INPUT)
    }

    await client.del(key)
    const verificationToken = randomUUID()
    await client.set(getVerifiedKey(verificationToken), email, {
        EX: VERIFIED_TTL_SECONDS,
    })

    return { verificationToken }
}

export const consumeSignupVerification = async (rawEmail: string, verificationToken: string): Promise<void> => {
    const email = normalizeEmail(rawEmail)
    const verifiedEmail = await client.getDel(getVerifiedKey(verificationToken))

    if (!verifiedEmail || verifiedEmail !== email) {
        throw createGraphQLError('Email verification is required', GQL_ERROR_CODES.BAD_USER_INPUT)
    }
}
