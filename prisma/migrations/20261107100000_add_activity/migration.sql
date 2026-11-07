CREATE TYPE "ActivityAction" AS ENUM ('created', 'updated', 'deleted');

CREATE TYPE "ActivityEntity" AS ENUM ('knowledge', 'connection', 'resource');

CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "entityType" "ActivityEntity" NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Activity_userId_createdAt_idx" ON "Activity"("userId", "createdAt");

ALTER TABLE "Activity"
ADD CONSTRAINT "Activity_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
