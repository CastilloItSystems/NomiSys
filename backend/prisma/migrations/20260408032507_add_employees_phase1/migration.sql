-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "secondName" VARCHAR(100),
    "lastName" VARCHAR(100) NOT NULL,
    "secondLastName" VARCHAR(100),
    "documentType" VARCHAR(1) NOT NULL,
    "documentNumber" VARCHAR(20) NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" VARCHAR(10) NOT NULL,
    "maritalStatus" VARCHAR(20),
    "nationality" VARCHAR(50),
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100),
    "address" TEXT NOT NULL,
    "birthPlace" VARCHAR(100),
    "employeeCode" VARCHAR(50) NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "departmentId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "costCenter" VARCHAR(50),
    "contractType" VARCHAR(50) NOT NULL,
    "workSchedule" VARCHAR(50) NOT NULL,
    "currentSalary" DECIMAL(15,2) NOT NULL,
    "salaryType" VARCHAR(10) NOT NULL,
    "paymentFrequency" VARCHAR(20) NOT NULL,
    "supervisorId" TEXT,
    "ivssNumber" VARCHAR(50),
    "rifNumber" VARCHAR(50),
    "faovRegistered" BOOLEAN NOT NULL DEFAULT false,
    "incesRegistered" BOOLEAN NOT NULL DEFAULT false,
    "familyCharges" INTEGER NOT NULL DEFAULT 0,
    "bankId" TEXT NOT NULL,
    "accountType" VARCHAR(20) NOT NULL,
    "accountNumber" VARCHAR(20) NOT NULL,
    "observations" TEXT,
    "emergencyContact" VARCHAR(100),
    "emergencyPhone" VARCHAR(20),
    "status" VARCHAR(50) NOT NULL DEFAULT 'Activo',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_job_info" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "employee_job_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salary_history" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "salary" DECIMAL(15,2) NOT NULL,
    "salaryType" VARCHAR(10) NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "previousSalary" DECIMAL(15,2),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "employee_salary_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_status_history" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "employee_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employees_companyId_idx" ON "employees"("companyId");

-- CreateIndex
CREATE INDEX "employees_departmentId_idx" ON "employees"("departmentId");

-- CreateIndex
CREATE INDEX "employees_positionId_idx" ON "employees"("positionId");

-- CreateIndex
CREATE INDEX "employees_bankId_idx" ON "employees"("bankId");

-- CreateIndex
CREATE INDEX "employees_supervisorId_idx" ON "employees"("supervisorId");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "employees"("status");

-- CreateIndex
CREATE INDEX "employees_isActive_idx" ON "employees"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "employees_companyId_documentType_documentNumber_key" ON "employees"("companyId", "documentType", "documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "employees_companyId_employeeCode_key" ON "employees"("companyId", "employeeCode");

-- CreateIndex
CREATE INDEX "employee_job_info_employeeId_idx" ON "employee_job_info"("employeeId");

-- CreateIndex
CREATE INDEX "employee_job_info_effectiveDate_idx" ON "employee_job_info"("effectiveDate");

-- CreateIndex
CREATE INDEX "employee_salary_history_employeeId_idx" ON "employee_salary_history"("employeeId");

-- CreateIndex
CREATE INDEX "employee_salary_history_effectiveDate_idx" ON "employee_salary_history"("effectiveDate");

-- CreateIndex
CREATE INDEX "employee_status_history_employeeId_idx" ON "employee_status_history"("employeeId");

-- CreateIndex
CREATE INDEX "employee_status_history_status_idx" ON "employee_status_history"("status");
