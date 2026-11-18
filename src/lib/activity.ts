import type { $Enums, Prisma } from '../generated/prisma/client.js'

type ActivityInput = {
    userId: string
    action: $Enums.ActivityAction
    entityType: $Enums.ActivityEntity
    summary: string
}

export function recordActivity(transaction: Prisma.TransactionClient, data: ActivityInput) {
    return transaction.activity.create({ data })
}
