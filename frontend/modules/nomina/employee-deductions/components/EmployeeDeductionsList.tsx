"use client";

import { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import CreateButton from "@/shared/components/CreateButton";
import DeleteConfirmDialog from "@/shared/components/DeleteConfirmDialog";
import EmployeeDeductionForm from "./EmployeeDeductionForm";
import { useEmployeeDeductionsData } from "../hooks/useEmployeeDeductionsData";
import { deleteEmployeeDeduction } from "../services/employeeDeduction.service";
import { EmployeeDeduction } from "../interfaces/employeeDeduction.interface";
import { handleFormError } from "@/utils/errorHandlers";

export default function EmployeeDeductionsList() {
  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);
  const { deductions, total, loading, mutate } = useEmployeeDeductionsData();
  const [selected, setSelected] = useState<EmployeeDeduction | null>(null);
  const [actionItem, setActionItem] = useState<EmployeeDeduction | null>(null);
  const [formDialog, setFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const menuItems: MenuItem[] = [
    {
      label: "Editar",
      icon: "pi pi-pencil",
      command: () => {
        setSelected(actionItem);
        setFormDialog(true);
      },
    },
    { separator: true },
    {
      label: "Eliminar",
      icon: "pi pi-trash",
      className: "p-menuitem-danger",
      command: () => {
        setSelected(actionItem);
        setDeleteDialog(true);
      },
    },
  ];

  const handleDelete = async () => {
    if (!selected?.id) return;
    try {
      setIsDeleting(true);
      await deleteEmployeeDeduction(selected.id);
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Deducción eliminada",
        life: 3000,
      });
      setDeleteDialog(false);
      setSelected(null);
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: selected?.id ? "Deducción actualizada" : "Deducción creada",
      life: 3000,
    });
    await mutate();
    setFormDialog(false);
    setSelected(null);
  };

  const fmt = (v: number | null) =>
    v != null ? `$${Number(v).toFixed(2)}` : "-";

  return (
    <>
      <Toast ref={toast} />
      <Menu ref={menuRef} model={menuItems} popup />
      <DataTable
        value={deductions}
        loading={loading}
        paginator
        rows={10}
        dataKey="id"
        scrollable
        header={
          <div className="flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h4 className="m-0">Deducciones de Empleados</h4>
              <span className="text-600 text-sm">({total} total)</span>
            </div>
            <CreateButton
              label="Nueva Deducción"
              onClick={() => {
                setSelected(null);
                setFormDialog(true);
              }}
            />
          </div>
        }
        emptyMessage="Sin deducciones"
      >
        <Column field="employeeId" header="Empleado" />
        <Column field="conceptId" header="Concepto" />
        <Column field="calcType" header="Tipo" />
        <Column
          header="Valor"
          body={(row) =>
            row.calcType === "Monto Fijo"
              ? fmt(row.amount)
              : `${row.percentage}%`
          }
        />
        <Column field="startDate" header="Desde" />
        <Column
          field="isActive"
          header="Activo"
          body={(row) => (
            <i
              className={`pi ${
                row.isActive
                  ? "pi-check text-green-500"
                  : "pi-times text-gray-400"
              }`}
            />
          )}
        />
        <Column
          body={(row) => (
            <i
              className="pi pi-cog cursor-pointer text-primary"
              style={{ fontSize: "1.2rem" }}
              onClick={(e: any) => {
                setActionItem(row);
                menuRef.current?.toggle(e);
              }}
            />
          )}
          style={{ width: "60px" }}
        />
      </DataTable>
      <Dialog
        header={selected?.id ? "Editar Deducción" : "Nueva Deducción"}
        visible={formDialog}
        onHide={() => {
          setFormDialog(false);
          setSelected(null);
        }}
        style={{ width: "520px" }}
        modal
      >
        <EmployeeDeductionForm
          deduction={selected}
          onSave={handleSave}
          onCancel={() => {
            setFormDialog(false);
            setSelected(null);
          }}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      </Dialog>
      <DeleteConfirmDialog
        visible={deleteDialog}
        onHide={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        itemName="¿Eliminar esta deducción?"
      />
    </>
  );
}
