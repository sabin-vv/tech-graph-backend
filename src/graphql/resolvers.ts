import { prisma } from '../lib/prisma.js'
import type { Resolvers } from '../generated/graphql.js'
import bcrypt from 'bcryptjs'
import { createAuthToken } from '../lib/auth.js'
import { requireAuth, type Context } from './context.js'

const includeKnowledgeRelation = {
    source: { include: { user: true } },
    target: { include: { user: true } },
}

export const resolvers: Resolvers<Context> = {
    Query: {
        me: async (_, __, context) => {
            if (!context.userId) throw new Error('Authentication required')

            return prisma.user.findUnique({
                where: {
                    id: context.userId,
                },
            })
        },

        knowledge: async (_, __, context) => {
            const userId = requireAuth(context)

            return await prisma.knowledge.findMany({
                where: {
                    userId,
                },
                include: {
                    user: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })
        },

        knowledgeById: async (_, args, context) => {
            const userId = requireAuth(context)

            return await prisma.knowledge.findFirst({
                where: {
                    id: args.id,
                    userId,
                },
                include: {
                    user: true,
                },
            })
        },

        connections: async (_, __, context) => {
            const userId = requireAuth(context)

            return await prisma.connection.findMany({
                where: {
                    userId,
                },
                include: includeKnowledgeRelation,
                orderBy: {
                    createdAt: 'desc',
                },
            })
        },

        connectionsByKnowledge: async (_, args, context) => {
            const userId = requireAuth(context)

            return await prisma.connection.findMany({
                where: {
                    userId,
                    OR: [{ sourceId: args.id }, { targetId: args.id }],
                },
                include: includeKnowledgeRelation,
            })
        },
        resources: async (_, __, context) => {
            const userId = requireAuth(context)

            return await prisma.resource.findMany({
                where: { userId },
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
        resourcesByKnowledge: async (_, args, context) => {
            const userId = requireAuth(context)

            return await prisma.resource.findMany({
                where: {
                    knowledgeId: args.id,
                    userId,
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
        createKnowledge: async (_, { input }, context) => {
            const userId = requireAuth(context)

            return await prisma.knowledge.create({
                data: {
                    ...input,
                    userId,
                },
                include: {
                    user: true,
                },
            })
        },

        updateKnowledge: async (_, { id, input }, context) => {
            const userId = requireAuth(context)

            const existingKnowledge = await prisma.knowledge.findFirst({
                where: {
                    id,
                    userId,
                },
            })

            if (!existingKnowledge) {
                throw new Error('Knowledge not found')
            }

            const data = Object.fromEntries(Object.entries(input).filter(([, v]) => v != null))
            return await prisma.knowledge.update({
                where: {
                    id,
                },
                data,
                include: {
                    user: true,
                },
            })
        },

        deleteKnowledge: async (_, { id }, context) => {
            const userId = requireAuth(context)

            const existingKnowledge = await prisma.knowledge.findFirst({
                where: {
                    id,
                    userId,
                },
            })

            if (!existingKnowledge) {
                throw new Error('Knowledge not found')
            }

            await prisma.knowledge.delete({ where: { id } })

            return true
        },

        createConnection: async (_, { input }, context) => {
            const userId = requireAuth(context)

            const knowledge = await prisma.knowledge.findMany({
                where: {
                    userId,
                    id: {
                        in: [input.sourceId, input.targetId],
                    },
                },
                select: {
                    id: true,
                },
            })
            if (knowledge.length !== 2) {
                throw new Error('Knowledge not found')
            }

            return await prisma.connection.create({
                data: {
                    ...input,
                    userId,
                },
                include: includeKnowledgeRelation,
            })
        },

        updateConnection: async (_, { id, input }, context) => {
            const userId = requireAuth(context)

            return await prisma.connection.update({
                where: {
                    id,
                    userId,
                },
                data: {
                    ...(input?.relation != null && { relation: input.relation }),
                },
                include: includeKnowledgeRelation,
            })
        },

        deleteConnection: async (_, { id }, context) => {
            const userId = requireAuth(context)

            await prisma.connection.delete({
                where: {
                    id,
                    userId,
                },
            })

            return true
        },

        createResource: async (_, { input }, context) => {
            const userId = requireAuth(context)

            const knowledge = await prisma.knowledge.findFirst({
                where: {
                    userId,
                    id: input.knowledgeId,
                },
            })

            if (!knowledge) {
                throw new Error('Knowledge not found')
            }

            return await prisma.resource.create({
                data: { ...input, userId },
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

        updateResource: async (__dirname, { id, input }, context) => {
            const userId = requireAuth(context)

            const data = Object.fromEntries(Object.entries(input).filter(([, v]) => v != null))

            return await prisma.resource.update({
                where: { id, userId },
                data,
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

        deleteResource: async (_, { id }, context) => {
            const userId = requireAuth(context)

            await prisma.resource.delete({
                where: { id, userId },
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

        login: async (_, { email, password }) => {
            const normalizedEmail = email.trim().toLowerCase()
            if (!normalizedEmail) throw new Error('Email is required')
            if (!password) throw new Error('Password is required')

            const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
            if (!user) throw new Error('Invalid credentials')

            const validPassword = await bcrypt.compare(password, user.passwordHash)

            if (!validPassword) throw new Error('Invalid credentials')

            const token = createAuthToken(user.id)

            return {
                token,
                user,
            }
        },
    },
}
