"use client";

import { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import CreateButton from "@/shared/components/CreateButton";
import LoanForm from "./LoanForm";
import { useLoansData } from "../hooks/useLoansData";
import { Loan } from "../interfaces/loan.interface";
import { handleFormError } from "@/utils/errorHandlers";

const STATUS_SEVERITY: Record<string, any> = {
  Activo: "success",
  Pagado: "info",
  Cancelado: "danger",
};

export default function LoansList() {
  const toast = useRef<Toast>(null);
  const { loans, total, loading, mutate } = useLoansData();
  const [formDialog, setFormDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: "Préstamo registrado",
      life: 3000,
    });
    await mutate();
    setFormDialog(false);
  };

  const fmt = (v: number) =>
    `$${Number(v).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;

  return (
    <>
      <Toast ref={toast} />
      <DataTable
        value={loans}
        loading={loading}
        paginator
        rows={10}
        dataKey="id"
        scrollable
        header={
          <div className="flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h4 className="m-0">Préstamos</h4>
              <span className="text-600 text-sm">({total} total)</span>
            </div>
            <CreateButton
              label="Nuevo Préstamo"
              onClick={() => setFormDialog(true)}
            />
          </div>
        }
        emptyMessage="Sin préstamos"
      >
        <Column field="employeeId" header="Empleado" />
        <Column field="amount" header="Monto" body={(row) => fmt(row.amount)} />
        <Column
          field="remainingBalance"
          header="Saldo"
          body={(row) => fmt(row.remainingBalance)}
        />
        <Column field="installments" header="Cuotas" />
        <Column
          field="installmentAmount"
          header="Cuota Mensual"
          body={(row) => fmt(row.installmentAmount)}
        />
        <Column field="startDate" header="Desde" />
        <Column
          field="status"
          header="Estado"
          body={(row) => (
            <Tag value={row.status} severity={STATUS_SEVERITY[row.status]} />
          )}
        />
      </DataTable>
      <Dialog
        header="Nuevo Préstamo"
        visible={formDialog}
        onHide={() => setFormDialog(false)}
        style={{ width: "500px" }}
        modal
      >
        <LoanForm
          onSave={handleSave}
          onCancel={() => setFormDialog(false)}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      </Dialog>
    </>
  );
}
