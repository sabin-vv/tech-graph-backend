import { prisma } from '../lib/prisma.js'
import { Prisma, KnowledgeType as PrismaKnowledgeType } from '../generated/prisma/client.js'
import type {
    Knowledge as GraphQLKnowledge,
    KnowledgeType as GraphQLKnowledgeType,
    Resolvers,
} from '../generated/graphql.js'

type KnowledgeWithUser = Prisma.KnowledgeGetPayload<{
    include: { user: true }
}>

function toGraphQLKnowledge(row: KnowledgeWithUser): GraphQLKnowledge {
    return {
        ...row,
        type: row.type as GraphQLKnowledgeType,
    }
}

export const resolvers: Resolvers = {
    Query: {
        knowledge: async () => {
            const rows = await prisma.knowledge.findMany({
                include: { user: true },
                orderBy: { createdAt: 'desc' },
            })

            return rows.map(toGraphQLKnowledge)
        },

        knowledgeById: async (_, args) => {
            const row = await prisma.knowledge.findUnique({
                where: { id: args.id },
                include: { user: true },
            })

            return row ? toGraphQLKnowledge(row) : null
        },
    },

    Mutation: {
        createKnowledge: async (_, { input }) => {
            const row = await prisma.knowledge.create({
                data: {
                    title: input.title,
                    description: input.description,
                    type: input.type as PrismaKnowledgeType,
                    tags: input.tags,
                    userId: input.userId,
                },
                include: { user: true },
            })

            return toGraphQLKnowledge(row)
        },

        updateKnowledge: async (_, { id, input }) => {
            const row = await prisma.knowledge.update({
                where: { id },
                data: {
                    ...(input.title != null && { title: input.title }),
                    ...(input.description != null && {
                        description: input.description,
                    }),
                    ...(input.type != null && {
                        type: input.type as PrismaKnowledgeType,
                    }),
                    ...(input.tags != null && { tags: input.tags }),
                },
                include: { user: true },
            })

            return toGraphQLKnowledge(row)
        },

        deleteKnowledge: async (_, { id }) => {
            await prisma.knowledge.delete({ where: { id } })
            return true
        },
    },
}
