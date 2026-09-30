import { prisma } from '../lib/prisma.js'
import type { Resolvers } from '../generated/graphql.js'
import bcrypt from 'bcryptjs'
import { createAuthToken } from '../lib/auth.js'

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
        resources: async () => {
            return await prisma.resource.findMany({
                include: {
                    user: true,
                    knowledge: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            })
        },
        resourcesByKnowledge: async (_, args) => {
            return await prisma.resource.findMany({
                where: {
                    knowledgeId: args.id,
                },
                include: {
                    user: true,
                    knowledge: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
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

        createResource: async (_, { input }) => {
            return await prisma.resource.create({
                data: input,
                include: {
                    user: true,
                    knowledge: {
                        include: {
                            user: true,
                        },
                    },
                },
            })
        },

        updateResource: async (__dirname, { id, input }) => {
            return await prisma.resource.update({
                where: { id },
                data: {
                    ...(input.title && { title: input.title }),
                    ...(input.type && { type: input.type }),
                    ...(input.description && { description: input.description }),
                    ...(input.url && { url: input.url }),
                },
                include: {
                    user: true,
                    knowledge: {
                        include: {
                            user: true,
                        },
                    },
                },
            })
        },

        deleteResource: async (_, { id }) => {
            await prisma.resource.delete({
                where: { id },
            })
            return true
        },
        signup: async (_, { input }) => {
            const name = input.name.trim()
            const email = input.email.trim().toLowerCase()
            const password = input.password

            if (!name) throw new Error('Name required')
            if (!email) throw new Error('Email required')
            if (!password.trim()) throw new Error('Password required')

            if (password.length < 8) throw new Error('Password should have min 8 character')

            const existingUser = await prisma.user.findUnique({ where: { email } })

            if (existingUser) throw new Error('This Email is already registered')

            const passwordHash = await bcrypt.hash(password, 12)

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                },
            })

            const token = createAuthToken(user.id)

            return {
                token,
                user,
            }
        },
    },
}
