-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'EMAIL';

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "correctAnswer" TEXT;

-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "score" INTEGER;
