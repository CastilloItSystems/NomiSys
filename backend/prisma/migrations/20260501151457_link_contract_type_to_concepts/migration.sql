-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "contractTypeId" TEXT;

-- AlterTable
ALTER TABLE "salary_concepts" ADD COLUMN     "contractTypeId" TEXT;

-- CreateIndex
CREATE INDEX "employees_contractTypeId_idx" ON "employees"("contractTypeId");

-- CreateIndex
CREATE INDEX "salary_concepts_contractTypeId_idx" ON "salary_concepts"("contractTypeId");

-- AddForeignKey
ALTER TABLE "salary_concepts" ADD CONSTRAINT "salary_concepts_contractTypeId_fkey" FOREIGN KEY ("contractTypeId") REFERENCES "contract_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
