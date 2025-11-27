-- AlterTable
ALTER TABLE "engineers" ADD COLUMN "isITEngineer" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "engineers" ALTER COLUMN "availableFrom" DROP NOT NULL,
ALTER COLUMN "availableFrom" SET DATA TYPE TEXT;
