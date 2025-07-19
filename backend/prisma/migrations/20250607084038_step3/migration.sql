-- DropForeignKey
ALTER TABLE "Artifact" DROP CONSTRAINT "Artifact_userId_fkey";

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;
