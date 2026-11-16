import { Prisma } from '../../generated/prisma/client.js'
import { createGraphQLError, GQL_ERROR_CODES } from './GraphQLError.js'

export const withPrismaErrorHandling = async <T>(operation: () => Promise<T>): Promise<T> => {
    try {
        return await operation()
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw createGraphQLError('The requested record was not found', GQL_ERROR_CODES.NOT_FOUND)
            }

            if (error.code === 'P2002') {
                throw createGraphQLError('A record with these details already exists', GQL_ERROR_CODES.CONFLICT)
            }
        }

        throw error
    }
}
