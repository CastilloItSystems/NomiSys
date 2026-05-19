"use client";

import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import useSWR from "swr";
import { getPayrollRuns } from "@/modules/nomina/payroll-runs/services/payrollRun.service";
import type { PayrollRun } from "@/modules/nomina/payroll-runs/interfaces/payrollRun.interface";
import type { Page } from "@/types";

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { label: String(y), value: y };
});

const FiscalReportePage: Page = () => {
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const { data: runsData, isLoading } = useSWR(
    ["payroll-runs-fiscal", year],
    ([, y]: [string, number]) => getPayrollRuns({ year: y }),
    { revalidateOnFocus: false },
  );

  const runs: PayrollRun[] = (runsData?.runs ?? []).filter(
    (r: PayrollRun) => r.status === "Pagado" || r.status === "Aprobado",
  );

  const fmt = (v: number) =>
    "$" + Number(v ?? 0).toLocaleString("es-VE", { minimumFractionDigits: 2 });

  const totals = runs.reduce(
    (acc, r) => ({
      gross: acc.gross + (r.totalGross ?? 0),
      deductions: acc.deductions + (r.totalDeductions ?? 0),
      net: acc.net + (r.totalNet ?? 0),
    }),
    { gross: 0, deductions: 0, net: 0 },
  );

  return (
    <div className="flex flex-column gap-4">
      <div className="card">
        <div className="flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h4 className="m-0 mb-1">Reporte Fiscal</h4>
            <p className="text-600 m-0 text-sm">
              Resumen de nóminas aprobadas/pagadas por año fiscal.
            </p>
          </div>
          <div className="flex align-items-center gap-2">
            <Dropdown
              value={year}
              options={YEAR_OPTIONS}
              onChange={(e) => setYear(e.value)}
              style={{ width: "120px" }}
            />
            <Button
              label="Exportar PDF"
              icon="pi pi-file-pdf"
              severity="danger"
              outlined
              size="small"
              disabled
            />
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="col-12 md:col-4">
          <div className="card text-center">
            <p className="text-600 text-sm m-0 mb-1">Total Bruto</p>
            <h4 className="m-0 text-primary">{fmt(totals.gross)}</h4>
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="card text-center">
            <p className="text-600 text-sm m-0 mb-1">Total Deducciones</p>
            <h4 className="m-0 text-orange-500">{fmt(totals.deductions)}</h4>
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="card text-center">
            <p className="text-600 text-sm m-0 mb-1">Total Neto Pagado</p>
            <h4 className="m-0 text-green-500">{fmt(totals.net)}</h4>
          </div>
        </div>
      </div>

      <DataTable
        value={runs}
        loading={isLoading}
        dataKey="id"
        emptyMessage="No hay nóminas para el año seleccionado"
        paginator
        rows={15}
      >
        <Column field="periodId" header="Período" />
        <Column field="status" header="Estado" />
        <Column field="employeeCount" header="Empleados" />
        <Column
          field="totalGross"
          header="Bruto"
          body={(row: PayrollRun) => fmt(row.totalGross)}
        />
        <Column
          field="totalDeductions"
          header="Deducciones"
          body={(row: PayrollRun) => fmt(row.totalDeductions)}
        />
        <Column
          field="totalNet"
          header="Neto"
          body={(row: PayrollRun) => <strong>{fmt(row.totalNet)}</strong>}
        />
      </DataTable>
    </div>
  );
};

export default FiscalReportePage;
