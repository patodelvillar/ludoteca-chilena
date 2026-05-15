-- DropForeignKey
ALTER TABLE "GameSuggestion" DROP CONSTRAINT "GameSuggestion_user_id_fkey";

-- AlterTable
ALTER TABLE "GameSuggestion" ADD COLUMN     "submitter_email" TEXT,
ADD COLUMN     "submitter_name" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "GameSuggestion" ADD CONSTRAINT "GameSuggestion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
