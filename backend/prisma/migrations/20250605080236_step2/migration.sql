/*
  Warnings:

  - You are about to drop the column `isImage` on the `Tag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_userId_fkey";

-- AlterTable
ALTER TABLE "Artifact" ADD COLUMN     "isImage" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "isImage";

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;
