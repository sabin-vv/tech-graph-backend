import { Resend } from 'resend'

import { createGraphQLError, GQL_ERROR_CODES } from './errors/GraphQLError.js'

export const sendSignupOtpEmail = async (email: string, otp: string): Promise<void> => {
    const apiKey = process.env.RESEND_API_KEY

    if (process.env.NODE_ENV !== 'production') {
        console.info(`[SIGNUP OTP] ${email}: ${otp}`)
        return
    }
    if (!apiKey) {
        throw createGraphQLError('Email delivery is not configured', GQL_ERROR_CODES.INTERNAL_SERVER_ERROR)
    }

    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
        from: 'TechGraph <onboarding@resend.dev>',
        to: [email],
        subject: 'Your TechGraph verification code',
        text: `Your TechGraph verification code is ${otp}. It expires in 5 minutes.`,
        html: `<p>Your TechGraph verification code is <strong>${otp}</strong>.</p><p>It expires in 5 minutes.</p>`,
    })

    if (error) {
        throw createGraphQLError('Unable to send verification email', GQL_ERROR_CODES.INTERNAL_SERVER_ERROR)
    }
}
