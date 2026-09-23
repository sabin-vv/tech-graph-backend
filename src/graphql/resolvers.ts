import { prisma } from '../lib/prisma.js'
import type { Resolvers } from '../generated/graphql.js'

const includeKnowledgeRelation = {
    source: { include: { user: true } },
    target: { include: { user: true } },
}

export const resolvers: Resolvers = {
    Query: {
        knowledge: async () => {
            return await prisma.knowledge.findMany({
                include: { user: true },
                orderBy: { createdAt: 'desc' },
            })
        },

        knowledgeById: async (_, args) => {
            return await prisma.knowledge.findUnique({
                where: { id: args.id },
                include: { user: true },
            })
        },

        connections: async () => {
            return await prisma.connection.findMany({
                include: includeKnowledgeRelation,
                orderBy: { createdAt: 'desc' },
            })
        },

        connectionsByKnowledge: async (_, args) => {
            return await prisma.connection.findMany({
                where: {
                    OR: [{ sourceId: args.id }, { targetId: args.id }],
                },
                include: includeKnowledgeRelation,
            })
        },
    },

    Mutation: {
        createKnowledge: async (_, { input }) => {
            return await prisma.knowledge.create({
                data: input,
                include: { user: true },
            })
        },

        updateKnowledge: async (_, { id, input }) => {
            const data = Object.fromEntries(Object.entries(input).filter(([, v]) => v != null))
            return await prisma.knowledge.update({
                where: { id },
                data,
                include: { user: true },
            })
        },

        deleteKnowledge: async (_, { id }) => {
            await prisma.knowledge.delete({ where: { id } })

            return true
        },

        createConnection: async (_, { input }) => {
            return await prisma.connection.create({
                data: input,
                include: includeKnowledgeRelation,
            })
        },

        updateConnection: async (_, { id, input }) => {
            return await prisma.connection.update({
                where: { id },
                data: { ...(input?.relation != null && { relation: input.relation }) },
                include: includeKnowledgeRelation,
            })
        },

        deleteConnection: async (_, { id }) => {
            await prisma.connection.delete({
                where: { id },
            })

            return true
        },
    },
}
