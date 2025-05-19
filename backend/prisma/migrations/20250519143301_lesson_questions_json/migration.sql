/*
  Warnings:

  - Added the required column `questions` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "isQuiz" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "questions" JSONB NOT NULL;
