-- AlterTable
ALTER TABLE "salary_concepts" ADD COLUMN     "executionOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "formula" TEXT,
ADD COLUMN     "inputVars" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "payroll_run_inputs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "vars" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_run_inputs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payroll_run_inputs_companyId_idx" ON "payroll_run_inputs"("companyId");

-- CreateIndex
CREATE INDEX "payroll_run_inputs_runId_idx" ON "payroll_run_inputs"("runId");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_run_inputs_runId_employeeId_key" ON "payroll_run_inputs"("runId", "employeeId");

-- CreateIndex
CREATE INDEX "salary_concepts_executionOrder_idx" ON "salary_concepts"("executionOrder");
