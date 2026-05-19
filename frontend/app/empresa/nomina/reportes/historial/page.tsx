"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import useSWR from "swr";
import { getPayrollRuns } from "@/modules/nomina/payroll-runs/services/payrollRun.service";
import type { PayrollRun } from "@/modules/nomina/payroll-runs/interfaces/payrollRun.interface";
import type { Page } from "@/types";

const STATUS_SEVERITY: Record<
  string,
  "success" | "info" | "warning" | "danger" | "secondary" | undefined
> = {
  Borrador: "secondary",
  Procesando: "warning",
  Procesado: "info",
  Aprobado: "success",
  Pagado: "success",
  Anulado: "danger",
};

const HistorialPage: Page = () => {
  const { data: runsData, isLoading } = useSWR(
    "payroll-runs-historial",
    () => getPayrollRuns(),
    { revalidateOnFocus: false },
  );

  const runs: PayrollRun[] = runsData?.runs ?? [];
  const fmt = (v: number) =>
    "$" + Number(v ?? 0).toLocaleString("es-VE", { minimumFractionDigits: 2 });

  return (
    <div className="flex flex-column gap-4">
      <div className="card">
        <div className="flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h4 className="m-0 mb-1">Historial de Nóminas</h4>
            <p className="text-600 m-0 text-sm">
              Todos los cálculos de nómina registrados en el sistema.
            </p>
          </div>
          <Button
            label="Exportar CSV"
            icon="pi pi-download"
            outlined
            size="small"
            disabled
          />
        </div>
      </div>

      <DataTable
        value={runs}
        loading={isLoading}
        dataKey="id"
        emptyMessage="No hay registros de nómina"
        paginator
        rows={20}
        sortField="createdAt"
        sortOrder={-1}
      >
        <Column field="periodId" header="Período" sortable />
        <Column
          field="status"
          header="Estado"
          sortable
          body={(row: PayrollRun) => (
            <Tag value={row.status} severity={STATUS_SEVERITY[row.status]} />
          )}
        />
        <Column field="employeeCount" header="Empleados" sortable />
        <Column
          field="totalGross"
          header="Bruto"
          body={(row: PayrollRun) => fmt(row.totalGross)}
          sortable
        />
        <Column
          field="totalDeductions"
          header="Deducciones"
          body={(row: PayrollRun) => fmt(row.totalDeductions)}
          sortable
        />
        <Column
          field="totalNet"
          header="Neto"
          body={(row: PayrollRun) => <strong>{fmt(row.totalNet)}</strong>}
          sortable
        />
        <Column
          field="createdAt"
          header="Fecha"
          sortable
          body={(row: PayrollRun) =>
            row.createdAt
              ? new Date(row.createdAt).toLocaleDateString("es-VE")
              : "—"
          }
        />
      </DataTable>
    </div>
  );
};

export default HistorialPage;
