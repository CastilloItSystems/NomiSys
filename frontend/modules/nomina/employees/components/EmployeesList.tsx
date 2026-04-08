"use client";

import { useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { useRouter } from "next/navigation";
import { useEmployeesData } from "@/modules/nomina/employees/hooks/useEmployeesData";

export default function EmployeesList() {
  const toast = useRef<Toast>(null);
  const router = useRouter();
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(10);

  const { employees, total, loading, mutate } = useEmployeesData(
    page,
    rows,
    globalFilterValue || undefined,
  );

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0); // Reset to first page on new search
    setGlobalFilterValue(e.target.value);
  };

  const actionBodyTemplate = (rowData: any) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          rounded
          text
          severity="info"
          tooltip="Ver"
          tooltipPosition="top"
          onClick={() => router.push(`/empresa/nomina/empleados/${rowData.id}`)}
        />
        <Button
          icon="pi pi-pencil"
          rounded
          text
          severity="warning"
          tooltip="Editar"
          tooltipPosition="top"
          onClick={() =>
            router.push(`/empresa/nomina/empleados/${rowData.id}/editar`)
          }
        />
      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />

      <div className="flex align-items-center justify-content-between mb-4">
        <h3>Empleados</h3>
        <Button
          label="Nuevo Empleado"
          icon="pi pi-plus"
          onClick={() => router.push("/empresa/nomina/empleados/nuevo")}
        />
      </div>

      <div className="flex gap-2 mb-4">
        <span className="p-input-icon-left w-full">
          <i className="pi pi-search" />
          <InputText
            type="search"
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Buscar por código, nombre o cédula..."
            className="w-full"
          />
        </span>
      </div>

      <DataTable
        value={employees}
        loading={loading}
        paginator
        rows={rows}
        totalRecords={total}
        onPage={(e) => {
          setPage(e.page ?? 0);
          setRows(e.rows ?? 10);
        }}
        scrollable
        scrollHeight="flex"
        emptyMessage="Sin empleados"
        lazy
      >
        <Column field="employeeCode" header="Código" sortable={false} />
        <Column
          header="Nombre"
          body={(rowData) => `${rowData.firstName} ${rowData.lastName}`}
          sortable={false}
        />
        <Column
          header="Cédula"
          body={(rowData) =>
            `${rowData.documentType}-${rowData.documentNumber}`
          }
          sortable={false}
        />
        <Column field="phone" header="Teléfono" sortable={false} />
        <Column field="status" header="Estatus" sortable={false} />
        <Column
          header="Acciones"
          body={actionBodyTemplate}
          frozen
          alignFrozen="right"
        />
      </DataTable>
    </>
  );
}
