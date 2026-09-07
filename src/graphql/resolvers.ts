import { prisma } from '../lib/prisma.js'

export const resolvers = {
    Query: {
        knowledge: async () => {
            return prisma.knowledge.findMany({
                include: {
                    user: true,
                },
            })
        },
    },
}
