import { prisma } from '../lib/prisma.js'
import type { Resolvers } from '../generated/graphql.js'
import bcrypt from 'bcryptjs'
import { createAuthToken } from '../lib/auth.js'
import { requireAuth, type Context } from './context.js'

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
                        throw new Error('Invalid activity cursor')
                    }

                    const createdAt = new Date(parsed.createdAt)
                    if (Number.isNaN(createdAt.getTime())) {
                        throw new Error('Invalid activity cursor')
                    }

                    cursorFilter = {
                        OR: [
                            { createdAt: { lt: createdAt } },
                            { createdAt, id: { lt: parsed.id } },
                        ],
                    }
                } catch {
                    throw new Error('Invalid activity cursor')
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

            const [knowledgeCount, connectionCount, resourceCount, tagCounts] =
                await Promise.all([
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
                    throw new Error(`Invalid ${field} setting`)
                }
            }

            return prisma.userSettings.upsert({
                where: { userId },
                create: {
                    userId,
                    ...defaultUserSettings,
                    ...data,
                },
                update: data,
            })
        },

        createKnowledge: async (_, { input }, context) => {
            const userId = requireAuth(context)

            return prisma.$transaction(async (transaction) => {
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

            return prisma.$transaction(async (transaction) => {
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
            })
        },

        deleteKnowledge: async (_, { id }, context) => {
            const userId = requireAuth(context)

            return await prisma.$transaction(async (transaction) => {
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
                    throw new Error('Knowledge not found')
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
            })
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
                throw new Error('Knowledge not found')
            }

            const source = knowledge.find((item) => item.id === input.sourceId)
            const target = knowledge.find((item) => item.id === input.targetId)
            if (!source || !target) {
                throw new Error('Knowledge not found')
            }

            return prisma.$transaction(async (transaction) => {
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
            })
        },

        updateConnection: async (_, { id, input }, context) => {
            const userId = requireAuth(context)

            return prisma.$transaction(async (transaction) => {
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
            })
        },

        deleteConnection: async (_, { id }, context) => {
            const userId = requireAuth(context)

            await prisma.$transaction(async (transaction) => {
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

            return prisma.$transaction(async (transaction) => {
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
            })
        },

        updateResource: async (__dirname, { id, input }, context) => {
            const userId = requireAuth(context)

            const data = Object.fromEntries(Object.entries(input).filter(([, v]) => v != null))

            return prisma.$transaction(async (transaction) => {
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
            })
        },

        deleteResource: async (_, { id }, context) => {
            const userId = requireAuth(context)

            await prisma.$transaction(async (transaction) => {
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
        updateProfile: async (_, { input }, context) => {
            const userId = requireAuth(context)

            const data = Object.fromEntries(
                Object.entries(input).filter(([, v]) => v != null),
            )

            if ('name' in data) {
                const name = String(data.name).trim()

                if (!name) {
                    throw new Error('Name cannot be empty')
                }
                data.name = name
            }

            if ('email' in data) {
                const email = String(data.email).trim().toLowerCase()

                if (!email) {
                    throw new Error('Email cannot be empty')
                }

                const existingUser = await prisma.user.findUnique({ where: { email } })

                if (existingUser && existingUser.id !== userId) {
                    throw new Error('This Email is already registered')
                }

                data.email = email
            }

            return prisma.$transaction(async (transaction) => {
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
            })
        }

    },
}
