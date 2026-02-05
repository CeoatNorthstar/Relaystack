/*
  Warnings:

  - The values [PRO] on the enum `Plan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Plan_new" AS ENUM ('FREE', 'STARTER', 'GROWTH', 'ENTERPRISE');
ALTER TABLE "Organization" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Organization" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TYPE "Plan" RENAME TO "Plan_old";
ALTER TYPE "Plan_new" RENAME TO "Plan";
DROP TYPE "Plan_old";
ALTER TABLE "Organization" ALTER COLUMN "plan" SET DEFAULT 'FREE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_apiKeyId_fkey";

-- AlterTable
ALTER TABLE "Request" ALTER COLUMN "apiKeyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
