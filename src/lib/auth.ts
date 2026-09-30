import jwt from 'jsonwebtoken'

const JWt_SECRET = process.env.JWT_SECRET

if (!JWt_SECRET) {
    throw new Error('JWT is not configured')
}

export const createAuthToken = (userId: String) => {
    return jwt.sign(
        {
            userId,
        },
        JWt_SECRET,
        {
            expiresIn: '7d',
        },
    )
}
