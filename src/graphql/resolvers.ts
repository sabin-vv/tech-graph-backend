import bcrypt from 'bcryptjs'

import type { Resolvers } from '../generated/graphql.js'
import { createAuthToken } from '../lib/auth.js'
import { createGraphQLError, GQL_ERROR_CODES } from '../lib/errors/GraphQLError.js'
import { withPrismaErrorHandling } from '../lib/errors/PrismaError.js'
import { consumeSignupVerification, createSignupOtp, verifySignupOtp } from '../lib/otp.js'
import { prisma } from '../lib/prisma.js'
import { type Context,requireAuth } from './context.js'

const includeKnowledgeRelation = {
    source: { include: { user: true } },
    target: { include: { user: true } },
}

const defaultUserSettings = {
    language: 'en',
    timeZone: 'local',
    dateFormat: 'yyyy-MM-dd',
    theme: 'dark',
    accentColor: 'violet',
    inAppNotifications: false,
    emailNotifications: false,
}

const userSettingsOptions = {
    language: ['en', 'es', 'ko', 'ja', 'hi', 'fr', 'de'],
    timeZone: ['local', 'UTC'],
    dateFormat: ['yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy'],
    theme: ['light', 'dark'],
    accentColor: ['violet', 'blue', 'teal', 'amber'],
} as const

export const resolvers: Resolvers<Context> = {
    Query: {
        me: async (_, __, context) => {
            if (!context.userId) throw createGraphQLError('Authentication required', GQL_ERROR_CODES.UNAUTHENTICATED)

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
        recentActivity: async (_, args, context) => {
            const userId = requireAuth(context)
            const limit = Math.max(1, Math.min(args.limit ?? 20, 50))
            let cursorFilter = {}

            if (args.cursor) {
                try {
                    const decoded = Buffer.from(args.cursor, 'base64url').toString('utf8')
                    const parsed: unknown = JSON.parse(decoded)
                    if (
                        typeof parsed !== 'object' ||
                        parsed === null ||
                        !('id' in parsed) ||
                        typeof parsed.id !== 'string' ||
                        !('createdAt' in parsed) ||
                        typeof parsed.createdAt !== 'string'
                    ) {
                        throw createGraphQLError('Invalid activity cursor', GQL_ERROR_CODES.BAD_USER_INPUT)
                    }

                    const createdAt = new Date(parsed.createdAt)
                    if (Number.isNaN(createdAt.getTime())) {
                        throw createGraphQLError('Invalid activity cursor', GQL_ERROR_CODES.BAD_USER_INPUT)
                    }

                    cursorFilter = {
                        OR: [{ createdAt: { lt: createdAt } }, { createdAt, id: { lt: parsed.id } }],
                    }
                } catch {
                    throw createGraphQLError('Invalid activity cursor', GQL_ERROR_CODES.BAD_USER_INPUT)
                }
            }

            const records = await prisma.activity.findMany({
                where: {
                    userId,
                    ...cursorFilter,
                },
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                take: limit + 1,
            })

            const hasMore = records.length > limit
            const items = hasMore ? records.slice(0, limit) : records
            const lastItem = items.at(-1)
            const nextCursor =
                hasMore && lastItem
                    ? Buffer.from(
                          JSON.stringify({
                              createdAt: lastItem.createdAt.toISOString(),
                              id: lastItem.id,
                          }),
                      ).toString('base64url')
                    : null

            return { items, nextCursor, hasMore }
        },

        dashboardSummary: async (_, __, context) => {
            const userId = requireAuth(context)

            const [knowledgeCount, connectionCount, resourceCount, tagCounts] = await Promise.all([
                prisma.knowledge.count({ where: { userId } }),
                prisma.connection.count({ where: { userId } }),
                prisma.resource.count({ where: { userId } }),
                prisma.$queryRaw<Array<{ count: number }>>`
                        SELECT COUNT(DISTINCT LOWER(BTRIM(tag)))::int AS count
                        FROM "Knowledge"
                        CROSS JOIN LATERAL UNNEST("tags") AS tags(tag)
                        WHERE "userId" = ${userId}
                          AND BTRIM(tag) <> ''
                    `,
            ])

            return {
                knowledgeCount,
                connectionCount,
                resourceCount,
                uniqueTagCount: tagCounts[0]?.count ?? 0,
            }
        },

        userSettings: async (_, __, context) => {
            const userId = requireAuth(context)
            const settings = await prisma.userSettings.findUnique({
                where: { userId },
            })

            return settings ?? defaultUserSettings
        },
    },

    Mutation: {
        updateUserSettings: async (_, { input }, context) => {
            const userId = requireAuth(context)
            const data = {
                ...(input.language != null && { language: input.language }),
                ...(input.timeZone != null && { timeZone: input.timeZone }),
                ...(input.dateFormat != null && { dateFormat: input.dateFormat }),
                ...(input.theme != null && { theme: input.theme }),
                ...(input.accentColor != null && { accentColor: input.accentColor }),
                ...(input.inAppNotifications != null && {
                    inAppNotifications: input.inAppNotifications,
                }),
                ...(input.emailNotifications != null && {
                    emailNotifications: input.emailNotifications,
                }),
            }

            for (const field of ['language', 'timeZone', 'dateFormat', 'theme', 'accentColor'] as const) {
                const value = input[field]
                const allowedValues: readonly string[] = userSettingsOptions[field]
                if (value != null && !allowedValues.includes(value)) {
                    throw createGraphQLError(`Invalid ${field} setting`, GQL_ERROR_CODES.BAD_USER_INPUT)
                }
            }

            return withPrismaErrorHandling(() =>
                prisma.userSettings.upsert({
                    where: { userId },
                    create: {
                        userId,
                        ...defaultUserSettings,
                        ...data,
                    },
                    update: data,
                }),
            )
        },

        createKnowledge: async (_, { input }, context) => {
            const userId = requireAuth(context)

            return withPrismaErrorHandling(() =>
                prisma.$transaction(async (transaction) => {
                    const knowledge = await transaction.knowledge.create({
                        data: {
                            ...input,
                            userId,
                        },
                        include: {
                            user: true,
                        },
                    })

                    await transaction.activity.create({
                        data: {
                            userId,
                            action: 'created',
                            entityType: 'knowledge',
                            summary: knowledge.title,
                        },
                    })

                    return knowledge
                }),
            )
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
                throw createGraphQLError('Knowledge not found', GQL_ERROR_CODES.NOT_FOUND)
            }

            const data = Object.fromEntries(Object.entries(input).filter(([, v]) => v != null))

            return withPrismaErrorHandling(() =>
                prisma.$transaction(async (transaction) => {
                    const knowledge = await transaction.knowledge.update({
                        where: { id },
                        data,
                        include: { user: true },
                    })

                    await transaction.activity.create({
                        data: {
                            userId,
                            action: 'updated',
                            entityType: 'knowledge',
                            summary: knowledge.title,
                        },
                    })

                    return knowledge
                }),
            )
        },

        deleteKnowledge: async (_, { id }, context) => {
            const userId = requireAuth(context)

            return await withPrismaErrorHandling(() =>
                prisma.$transaction(async (transaction) => {
                    const existingKnowledge = await transaction.knowledge.findFirst({
                        where: {
                            id,
                            userId,
                        },
                        select: {
                            id: true,
                            title: true,
                        },
                    })

                    if (!existingKnowledge) {
                        throw createGraphQLError('Knowledge not found', GQL_ERROR_CODES.NOT_FOUND)
                    }

                    await transaction.connection.deleteMany({
                        where: {
                            userId,
                            OR: [{ sourceId: id }, { targetId: id }],
                        },
                    })

                    await transaction.resource.deleteMany({
                        where: {
                            knowledgeId: id,
                            userId,
                        },
                    })

                    await transaction.knowledge.delete({
                        where: {
                            id,
                        },
                    })

                    await transaction.activity.create({
                        data: {
                            userId,
                            action: 'deleted',
                            entityType: 'knowledge',
                            summary: existingKnowledge.title,
                        },
                    })

                    return true
                }),
            )
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
                    title: true,
                },
            })
            if (knowledge.length !== 2) {
                throw createGraphQLError('Knowledge not found', GQL_ERROR_CODES.NOT_FOUND)
            }

            const source = knowledge.find((item) => item.id === input.sourceId)
            const target = knowledge.find((item) => item.id === input.targetId)
            if (!source || !target) {
                throw createGraphQLError('Knowledge not found', GQL_ERROR_CODES.NOT_FOUND)
            }

            return withPrismaErrorHandling(() =>
                prisma.$transaction(async (transaction) => {
                    const connection = await transaction.connection.create({
                        data: {
                            ...input,
                            userId,
                        },
                        include: includeKnowledgeRelation,
                    })

                    await transaction.activity.create({
                        data: {
                            userId,
                            action: 'created',
                            entityType: 'connection',
                            summary: `${source.title} → ${input.relation} → ${target.title}`,
                        },
                    })

                    return connection
                }),
            )
        },

        updateConnection: async (_, { id, input }, context) => {
            const userId = requireAuth(context)

            return withPrismaErrorHandling(() =>
                prisma.$transaction(async (transaction) => {
                    const connection = await transaction.connection.update({
                        where: {
                            id,
                            userId,
                        },
                        data: {
                            ...(input?.relation != null && { relation: input.relation }),
                        },
                        include: includeKnowledgeRelation,
                    })

                    await transaction.activity.create({
                        data: {
                            userId,
                            action: 'updated',
                            entityType: 'connection',
                            summary: `${connection.source.title} → ${connection.relation} → ${connection.target.title}`,
                        },
                    })

                    return connection
                }),
            )
        },

        deleteConnection: async (_, { id }, context) => {
            const userId = requireAuth(context)

            await withPrismaErrorHandling(() =>
                prisma.$transaction(async (transaction) => {
                    const connection = await transaction.connection.delete({
                        where: {
                            id,
                            userId,
                        },
                        include: includeKnowledgeRelation,
                    })

                    await transaction.activity.create({
                        data: {
                            userId,
                            action: 'deleted',
                            entityType: 'connection',
                            summary: `${connection.source.title} → ${connection.relation} → ${connection.target.title}`,
                        },
                    })
                }),
            )

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
                throw createGraphQLError('Knowledge not found', GQL_ERROR_CODES.NOT_FOUND)
            }

            return withPrismaErrorHandling(() =>
                prisma.$transaction(async (transaction) => {
                    const resource = await transaction.resource.create({
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

                    await transaction.activity.create({
                        data: {
                            userId,
                            action: 'created',
                            entityType: 'resource',
                            summary: resource.title,
                        },
                    })

                    return resource
                }),
            )
        },

        updateResource: async (__dirname, { id, input }, context) => {
            const userId = requireAuth(context)

            const data = Object.fromEntries(Object.entries(input).filter(([, v]) => v != null))

            return withPrismaErrorHandling(() =>
                prisma.$transaction(async (transaction) => {
                    const resource = await transaction.resource.update({
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

                    await transaction.activity.create({
                        data: {
                            userId,
                            action: 'updated',
                            entityType: 'resource',
                            summary: resource.title,
                        },
                    })

                    return resource
                }),
            )
        },

        deleteResource: async (_, { id }, context) => {
            const userId = requireAuth(context)

            await withPrismaErrorHandling(() =>
                prisma.$transaction(async (transaction) => {
                    const resource = await transaction.resource.delete({
                        where: { id, userId },
                    })

                    await transaction.activity.create({
                        data: {
                            userId,
                            action: 'deleted',
                            entityType: 'resource',
                            summary: resource.title,
                        },
                    })
                }),
            )
            return true
        },

        createSignupOtp: async (_, { email }) => {
            const normalizedEmail = email.trim().toLowerCase()
            const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })

            if (existingUser) {
                throw createGraphQLError('This Email is already registered', GQL_ERROR_CODES.CONFLICT)
            }

            return createSignupOtp(normalizedEmail)
        },

        verifySignupOtp: async (_, { email, challengeId, otp }) => verifySignupOtp(email, challengeId, otp),

        signup: async (_, { input, verificationToken }) => {
            const name = input.name.trim()
            const email = input.email.trim().toLowerCase()
            const password = input.password

            if (!name) throw createGraphQLError('Name required', GQL_ERROR_CODES.BAD_USER_INPUT)
            if (!email) throw createGraphQLError('Email required', GQL_ERROR_CODES.BAD_USER_INPUT)
            if (!password.trim()) throw createGraphQLError('Password required', GQL_ERROR_CODES.BAD_USER_INPUT)

            if (password.length < 8)
                throw createGraphQLError('Password should have min 8 character', GQL_ERROR_CODES.BAD_USER_INPUT)

            const existingUser = await prisma.user.findUnique({ where: { email } })

            if (existingUser) throw createGraphQLError('This Email is already registered', GQL_ERROR_CODES.CONFLICT)

            await consumeSignupVerification(email, verificationToken)

            const passwordHash = await bcrypt.hash(password, 12)

            const user = await withPrismaErrorHandling(() =>
                prisma.user.create({
                    data: {
                        name,
                        email,
                        passwordHash,
                    },
                }),
            )

            const token = createAuthToken(user.id)

            return {
                token,
                user,
            }
        },

        login: async (_, { email, password }) => {
            const normalizedEmail = email.trim().toLowerCase()
            if (!normalizedEmail) throw createGraphQLError('Email is required', GQL_ERROR_CODES.BAD_USER_INPUT)
            if (!password) throw createGraphQLError('Password is required', GQL_ERROR_CODES.BAD_USER_INPUT)

            const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
            if (!user) throw createGraphQLError('Invalid credentials', GQL_ERROR_CODES.INVALID_CREDENTIALS)

            const validPassword = await bcrypt.compare(password, user.passwordHash)

            if (!validPassword) throw createGraphQLError('Invalid credentials', GQL_ERROR_CODES.INVALID_CREDENTIALS)

            const token = createAuthToken(user.id)

            return {
                token,
                user,
            }
        },
        changePassword: async (_, { currentPassword, newPassword }, context) => {
            const userId = requireAuth(context)
            const user = await prisma.user.findUnique({ where: { id: userId } })

            if (!user) throw createGraphQLError('User not found', GQL_ERROR_CODES.NOT_FOUND)
            const validPassword = await bcrypt.compare(currentPassword, user.passwordHash)
            if (!validPassword)
                throw createGraphQLError('Current password is incorrect', GQL_ERROR_CODES.BAD_USER_INPUT)

            if (newPassword.length < 8) {
                throw createGraphQLError('Password must contain at least 8 characters', GQL_ERROR_CODES.BAD_USER_INPUT)
            }
            if (!/[a-z]/.test(newPassword)) {
                throw createGraphQLError('Password must contain a lowercase character', GQL_ERROR_CODES.BAD_USER_INPUT)
            }
            if (!/[A-Z]/.test(newPassword)) {
                throw createGraphQLError('Password must contain an uppercase character', GQL_ERROR_CODES.BAD_USER_INPUT)
            }
            if (!/[0-9]/.test(newPassword)) {
                throw createGraphQLError('Password must contain a number', GQL_ERROR_CODES.BAD_USER_INPUT)
            }

            const passwordHash = await bcrypt.hash(newPassword, 12)
            await withPrismaErrorHandling(() =>
                prisma.user.update({
                    where: { id: userId },
                    data: { passwordHash },
                }),
            )

            return true
        },
        updateProfile: async (_, { input }, context) => {
            const userId = requireAuth(context)

            const data = Object.fromEntries(Object.entries(input).filter(([, v]) => v != null))

            if ('name' in data) {
                const name = String(data.name).trim()

                if (!name) {
                    throw createGraphQLError('Name cannot be empty', GQL_ERROR_CODES.BAD_USER_INPUT)
                }
                data.name = name
            }

            if ('email' in data) {
                const email = String(data.email).trim().toLowerCase()

                if (!email) {
                    throw createGraphQLError('Email cannot be empty', GQL_ERROR_CODES.BAD_USER_INPUT)
                }

                const existingUser = await prisma.user.findUnique({ where: { email } })

                if (existingUser && existingUser.id !== userId) {
                    throw createGraphQLError('This Email is already registered', GQL_ERROR_CODES.CONFLICT)
                }

                data.email = email
            }

            return withPrismaErrorHandling(() =>
                prisma.$transaction(async (transaction) => {
                    const user = await transaction.user.update({
                        where: {
                            id: userId,
                        },
                        data,
                    })

                    await transaction.activity.create({
                        data: {
                            userId,
                            action: 'updated',
                            entityType: 'profile',
                            summary: 'Updated profile',
                        },
                    })

                    return user
                }),
            )
        },
    },
}
