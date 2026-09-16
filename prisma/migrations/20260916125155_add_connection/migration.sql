/*
  Warnings:

  - The values [dpends_on] on the enum `Relation` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Relation_new" AS ENUM ('uses', 'related_to', 'part_of', 'depends_on', 'built_with', 'extends');
ALTER TABLE "Connection" ALTER COLUMN "relation" TYPE "Relation_new" USING ("relation"::text::"Relation_new");
ALTER TYPE "Relation" RENAME TO "Relation_old";
ALTER TYPE "Relation_new" RENAME TO "Relation";
DROP TYPE "public"."Relation_old";
COMMIT;
