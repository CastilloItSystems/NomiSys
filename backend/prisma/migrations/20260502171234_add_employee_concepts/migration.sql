-- CreateTable
CREATE TABLE "employee_concepts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "manualAmount" DECIMAL(15,2),
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_concepts_companyId_idx" ON "employee_concepts"("companyId");

-- CreateIndex
CREATE INDEX "employee_concepts_employeeId_idx" ON "employee_concepts"("employeeId");

-- CreateIndex
CREATE INDEX "employee_concepts_conceptId_idx" ON "employee_concepts"("conceptId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_concepts_companyId_employeeId_conceptId_key" ON "employee_concepts"("companyId", "employeeId", "conceptId");
