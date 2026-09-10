import { prisma } from '../lib/prisma.js'

const MAX_TAG_LENGTH = 30
const MAX_TAG_COUNT = 10

export const resolvers = {
    Query: {
        knowledge: async () => {
            return prisma.knowledge.findMany({
                include: {
                    user: true,
                },
            })
        },
        knowledgeById: async (_: unknown, args: { id: string }) => {
            return prisma.knowledge.findUnique({
                where: { id: args.id },
                include: { user: true },
            })
        },
    },
    Mutation: {
        createKnowledge: async (
            _: unknown,
            args: {
                input: {
                    title: string
                    description: string
                    type: 'technology' | 'concept' | 'algorithm' | 'database'
                    tags: string[]
                    userId: string
                }
            }
        ) => {
            const { tags } = args.input

            if (tags.length > MAX_TAG_COUNT) {
                throw new Error(`Maximum ${MAX_TAG_COUNT} tags allowed`)
            }

            for (const tag of tags) {
                if (tag.length > MAX_TAG_LENGTH) {
                    throw new Error(`Tag "${tag}" must be ${MAX_TAG_LENGTH} characters or less`)
                }
            }

            return prisma.knowledge.create({
                data: {
                    title: args.input.title,
                    description: args.input.description,
                    type: args.input.type,
                    tags: args.input.tags,
                    userId: args.input.userId,
                },
                include: {
                    user: true,
                },
            })
        },
    },
}
