"use client";

import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Panel } from "primereact/panel";
import { Divider } from "primereact/divider";
import useSWR from "swr";
import {
  getPayrollRuns,
  getPayrollRunLines,
} from "@/modules/nomina/payroll-runs/services/payrollRun.service";
import { getPayrollPeriods } from "@/modules/nomina/payroll-periods/services/payrollPeriod.service";
import { getEmployees } from "@/modules/nomina/employees/services/employee.service";
import type {
  PayrollRun,
  PayrollRunLine,
} from "@/modules/nomina/payroll-runs/interfaces/payrollRun.interface";
import type { PayrollPeriod } from "@/modules/nomina/payroll-periods/interfaces/payrollPeriod.interface";
import type { Employee } from "@/modules/nomina/employees/interfaces/employee.interface";
import type { Page } from "@/types";

const STATUS_SEVERITY: Record<string, any> = {
  Borrador: "secondary",
  Procesando: "warning",
  Procesado: "info",
  Aprobado: "success",
  Pagado: "success",
  Anulado: "danger",
};

const fmt = (v: number | string) =>
  "$" +
  Number(v).toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ComprobantesPage: Page = () => {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const { data: runsData, isLoading: runsLoading } = useSWR(
    "payroll-runs-comprobantes",
    () => getPayrollRuns({ limit: 100 }),
    { revalidateOnFocus: false },
  );
  const { data: periodsData } = useSWR(
    "payroll-periods-comprobantes",
    () => getPayrollPeriods(),
    { revalidateOnFocus: false },
  );
  const { data: employeesData } = useSWR(
    "employees-comprobantes",
    () => getEmployees(0, 500),
    { revalidateOnFocus: false },
  );
  const { data: lines, isLoading: linesLoading } = useSWR(
    selectedRunId ? ["run-lines", selectedRunId] : null,
    () => getPayrollRunLines(selectedRunId as string),
    { revalidateOnFocus: false },
  );

  const runs: PayrollRun[] = runsData?.runs ?? [];
  const periods: PayrollPeriod[] = periodsData?.payrollPeriods ?? [];
  const employees: Employee[] =
    (employeesData as any)?.data ?? (employeesData as any)?.employees ?? [];

  const periodMap = Object.fromEntries(periods.map((p) => [p.id, p]));
  const employeeMap = Object.fromEntries(
    employees.map((e: Employee) => [e.id, e]),
  );

  const runOptions = runs.map((r) => {
    const period = periodMap[r.periodId];
    return {
      label: `${period?.name ?? r.periodId} — ${r.runType} (${r.status})`,
      value: r.id,
    };
  });

  const selectedRun = runs.find((r) => r.id === selectedRunId);
  const selectedPeriod = selectedRun ? periodMap[selectedRun.periodId] : null;
  const linesArr: PayrollRunLine[] = Array.isArray(lines) ? lines : [];

  const employeeNameBody = (row: PayrollRunLine) => {
    const emp = employeeMap[row.employeeId];
    return emp
      ? `${emp.firstName} ${emp.lastName} (${
          emp.employeeCode ?? emp.documentNumber
        })`
      : row.employeeId;
  };

  const conceptsBody = (row: PayrollRunLine) => {
    const ingresos = (row.details?.concepts ?? []).filter(
      (c: any) => c.type !== "Deducción",
    );
    const deducciones = (row.details?.concepts ?? []).filter(
      (c: any) => c.type === "Deducción",
    );
    return (
      <div className="text-sm" style={{ minWidth: "240px" }}>
        {ingresos.map((c: any, i: number) => (
          <div key={i} className="flex justify-content-between gap-3">
            <span className="text-700">{c.name}</span>
            <span className="text-green-600 font-medium">{fmt(c.amount)}</span>
          </div>
        ))}
        {deducciones.length > 0 && <Divider className="my-1" />}
        {deducciones.map((c: any, i: number) => (
          <div key={i} className="flex justify-content-between gap-3">
            <span className="text-600">{c.name}</span>
            <span className="text-red-500">-{fmt(c.amount)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-column gap-4">
      {/* ── Selector de nómina ── */}
      <div className="card">
        <h4 className="m-0 mb-3">Comprobantes de Pago</h4>
        <div className="field" style={{ maxWidth: "560px" }}>
          <label className="font-medium">Seleccionar Cálculo de Nómina</label>
          <Dropdown
            value={selectedRunId}
            options={runOptions}
            onChange={(e) => setSelectedRunId(e.value)}
            loading={runsLoading}
            placeholder="Seleccione un período calculado..."
            className="w-full mt-1"
            filter
          />
        </div>

        {/* ── Resumen del run seleccionado ── */}
        {selectedRun && (
          <div className="flex gap-4 mt-3 flex-wrap p-3 border-round surface-100">
            {selectedPeriod && (
              <span>
                <span className="text-600 text-sm block">Período</span>
                <strong>{selectedPeriod.name}</strong>
                <span className="text-500 text-sm ml-2">
                  (
                  {new Date(selectedPeriod.startDate).toLocaleDateString(
                    "es-VE",
                  )}{" "}
                  –{" "}
                  {new Date(selectedPeriod.endDate).toLocaleDateString("es-VE")}
                  )
                </span>
              </span>
            )}
            <span>
              <span className="text-600 text-sm block">Estado</span>
              <Tag
                value={selectedRun.status}
                severity={STATUS_SEVERITY[selectedRun.status]}
              />
            </span>
            <span>
              <span className="text-600 text-sm block">Empleados</span>
              <strong>{selectedRun.employeeCount}</strong>
            </span>
            <span>
              <span className="text-600 text-sm block">Total Bruto</span>
              <strong className="text-green-600">
                {fmt(selectedRun.totalGross)}
              </strong>
            </span>
            <span>
              <span className="text-600 text-sm block">Deducciones</span>
              <strong className="text-red-500">
                {fmt(selectedRun.totalDeductions)}
              </strong>
            </span>
            <span>
              <span className="text-600 text-sm block">Total Neto</span>
              <strong className="text-primary text-xl">
                {fmt(selectedRun.totalNet)}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* ── Tabla detalle por empleado ── */}
      {selectedRunId && (
        <div className="card">
          <DataTable
            value={linesArr}
            loading={linesLoading}
            dataKey="id"
            scrollable
            paginator
            rows={25}
            header={
              <div className="flex align-items-center justify-content-between">
                <h5 className="m-0">Detalle por Empleado</h5>
                <span className="text-600 text-sm">
                  {linesArr.length} empleados
                </span>
              </div>
            }
            emptyMessage={
              selectedRun?.status === "Borrador"
                ? 'Esta nómina aún no ha sido procesada. Vaya a Cálculos de Nómina y presione "Procesar".'
                : "Sin líneas de nómina"
            }
          >
            <Column
              header="Empleado"
              body={employeeNameBody}
              style={{ minWidth: "200px" }}
              sortable
              sortField="employeeId"
            />
            <Column
              header="Conceptos / Desglose"
              body={conceptsBody}
              style={{ minWidth: "280px" }}
            />
            <Column
              field="grossSalary"
              header="Bruto"
              body={(row: PayrollRunLine) => (
                <span className="text-green-600 font-medium">
                  {fmt(row.grossSalary)}
                </span>
              )}
              sortable
            />
            <Column
              field="totalDeductions"
              header="Deducciones"
              body={(row: PayrollRunLine) => (
                <span className="text-red-500">
                  -{fmt(row.totalDeductions)}
                </span>
              )}
              sortable
            />
            <Column
              field="netSalary"
              header="Neto a pagar"
              body={(row: PayrollRunLine) => (
                <strong className="text-primary text-lg">
                  {fmt(row.netSalary)}
                </strong>
              )}
              sortable
            />
          </DataTable>
        </div>
      )}
    </div>
  );
};

export default ComprobantesPage;
