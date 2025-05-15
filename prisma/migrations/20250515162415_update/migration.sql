/*
  Warnings:

  - Added the required column `content` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "content" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "participant" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
