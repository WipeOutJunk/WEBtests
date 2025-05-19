-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "requireEmail" BOOLEAN NOT NULL DEFAULT false;
