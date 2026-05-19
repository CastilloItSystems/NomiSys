-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_types" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_deductions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "calcType" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(15,2),
    "percentage" DECIMAL(5,4),
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_deductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    "approvedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "remainingBalance" DECIMAL(15,2) NOT NULL,
    "installments" INTEGER NOT NULL,
    "installmentAmount" DECIMAL(15,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "reason" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Activo',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overtime" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(5,2) NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "reason" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    "approvedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "overtime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_config" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "salarioMinimo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "salarioMinimoBs" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tasaCambio" DECIMAL(15,6) NOT NULL DEFAULT 1,
    "ivssRate" DECIMAL(5,4) NOT NULL DEFAULT 0.04,
    "faovRate" DECIMAL(5,4) NOT NULL DEFAULT 0.01,
    "incesRate" DECIMAL(5,4) NOT NULL DEFAULT 0.005,
    "ivssMaxSalarios" INTEGER NOT NULL DEFAULT 5,
    "bonoAlimentacion" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "bonoAlimentacionAplica" BOOLEAN NOT NULL DEFAULT true,
    "utilidadesDias" INTEGER NOT NULL DEFAULT 15,
    "islrAplica" BOOLEAN NOT NULL DEFAULT false,
    "islrUMT" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "prestacionesDiasGarantia" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_runs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "runType" VARCHAR(30) NOT NULL DEFAULT 'Regular',
    "status" VARCHAR(20) NOT NULL DEFAULT 'Borrador',
    "totalGross" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalNet" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "employeeCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "processedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_run_lines" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "grossSalary" DECIMAL(15,2) NOT NULL,
    "totalDeductions" DECIMAL(15,2) NOT NULL,
    "netSalary" DECIMAL(15,2) NOT NULL,
    "details" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_run_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_concepts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "isTaxable" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_benefits" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "period" VARCHAR(20) NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "salarioIntegral" DECIMAL(15,2) NOT NULL,
    "diasGarantia" INTEGER NOT NULL DEFAULT 15,
    "monto" DECIMAL(15,2) NOT NULL,
    "montoAcumulado" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Activo',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_requests" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "reason" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    "approvedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_companyId_idx" ON "attendance"("companyId");

-- CreateIndex
CREATE INDEX "attendance_employeeId_idx" ON "attendance"("employeeId");

-- CreateIndex
CREATE INDEX "attendance_date_idx" ON "attendance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_companyId_employeeId_date_key" ON "attendance"("companyId", "employeeId", "date");

-- CreateIndex
CREATE INDEX "contract_types_companyId_idx" ON "contract_types"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "contract_types_companyId_name_key" ON "contract_types"("companyId", "name");

-- CreateIndex
CREATE INDEX "employee_deductions_companyId_idx" ON "employee_deductions"("companyId");

-- CreateIndex
CREATE INDEX "employee_deductions_employeeId_idx" ON "employee_deductions"("employeeId");

-- CreateIndex
CREATE INDEX "employee_deductions_conceptId_idx" ON "employee_deductions"("conceptId");

-- CreateIndex
CREATE INDEX "leave_requests_companyId_idx" ON "leave_requests"("companyId");

-- CreateIndex
CREATE INDEX "leave_requests_employeeId_idx" ON "leave_requests"("employeeId");

-- CreateIndex
CREATE INDEX "leave_requests_status_idx" ON "leave_requests"("status");

-- CreateIndex
CREATE INDEX "loans_companyId_idx" ON "loans"("companyId");

-- CreateIndex
CREATE INDEX "loans_employeeId_idx" ON "loans"("employeeId");

-- CreateIndex
CREATE INDEX "loans_status_idx" ON "loans"("status");

-- CreateIndex
CREATE INDEX "overtime_companyId_idx" ON "overtime"("companyId");

-- CreateIndex
CREATE INDEX "overtime_employeeId_idx" ON "overtime"("employeeId");

-- CreateIndex
CREATE INDEX "overtime_status_idx" ON "overtime"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_config_companyId_key" ON "payroll_config"("companyId");

-- CreateIndex
CREATE INDEX "payroll_runs_companyId_idx" ON "payroll_runs"("companyId");

-- CreateIndex
CREATE INDEX "payroll_runs_status_idx" ON "payroll_runs"("status");

-- CreateIndex
CREATE INDEX "payroll_runs_runType_idx" ON "payroll_runs"("runType");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_runs_companyId_periodId_runType_key" ON "payroll_runs"("companyId", "periodId", "runType");

-- CreateIndex
CREATE INDEX "payroll_run_lines_companyId_idx" ON "payroll_run_lines"("companyId");

-- CreateIndex
CREATE INDEX "payroll_run_lines_runId_idx" ON "payroll_run_lines"("runId");

-- CreateIndex
CREATE INDEX "payroll_run_lines_employeeId_idx" ON "payroll_run_lines"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_run_lines_runId_employeeId_key" ON "payroll_run_lines"("runId", "employeeId");

-- CreateIndex
CREATE INDEX "salary_concepts_companyId_idx" ON "salary_concepts"("companyId");

-- CreateIndex
CREATE INDEX "salary_concepts_type_idx" ON "salary_concepts"("type");

-- CreateIndex
CREATE UNIQUE INDEX "salary_concepts_companyId_code_key" ON "salary_concepts"("companyId", "code");

-- CreateIndex
CREATE INDEX "social_benefits_companyId_idx" ON "social_benefits"("companyId");

-- CreateIndex
CREATE INDEX "social_benefits_employeeId_idx" ON "social_benefits"("employeeId");

-- CreateIndex
CREATE INDEX "social_benefits_year_quarter_idx" ON "social_benefits"("year", "quarter");

-- CreateIndex
CREATE UNIQUE INDEX "social_benefits_companyId_employeeId_year_quarter_key" ON "social_benefits"("companyId", "employeeId", "year", "quarter");

-- CreateIndex
CREATE INDEX "vacation_requests_companyId_idx" ON "vacation_requests"("companyId");

-- CreateIndex
CREATE INDEX "vacation_requests_employeeId_idx" ON "vacation_requests"("employeeId");

-- CreateIndex
CREATE INDEX "vacation_requests_status_idx" ON "vacation_requests"("status");
