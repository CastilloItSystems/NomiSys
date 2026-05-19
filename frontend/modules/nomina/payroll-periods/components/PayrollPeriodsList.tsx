"use client";

import { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Menu } from "primereact/menu";
import { Tag } from "primereact/tag";
import type { MenuItem } from "primereact/menuitem";
import CreateButton from "@/shared/components/CreateButton";
import DeleteConfirmDialog from "@/shared/components/DeleteConfirmDialog";
import FormActionButtons from "@/shared/components/FormActionButtons";
import PayrollPeriodForm from "./PayrollPeriodForm";
import { usePayrollPeriodsData } from "@/modules/nomina/payroll-periods/hooks/usePayrollPeriodsData";
import { deletePayrollPeriod } from "@/modules/nomina/payroll-periods/services/payrollPeriod.service";
import {
  PayrollPeriod,
  PayrollPeriodStatus,
} from "@/modules/nomina/payroll-periods/interfaces/payrollPeriod.interface";
import { handleFormError } from "@/utils/errorHandlers";

// ── Status tag helpers ────────────────────────────────────────────────────────
const STATUS_SEVERITY: Record<
  PayrollPeriodStatus,
  "info" | "warning" | "success" | "secondary"
> = {
  Borrador: "secondary",
  Abierto: "info",
  Cerrado: "warning",
  Pagado: "success",
};

const statusTemplate = (rowData: PayrollPeriod) => (
  <Tag
    value={rowData.status}
    severity={STATUS_SEVERITY[rowData.status] ?? "secondary"}
  />
);

const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// ──────────────────────────────────────────────────────────────────────────────

export default function PayrollPeriodsList() {
  // ──────────────────────────────────────────────────────────────────
  // REFS & DATA
  // ──────────────────────────────────────────────────────────────────
  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { payrollPeriods, total, loading, mutate } = usePayrollPeriodsData(
    searchQuery || undefined,
  );

  // ──────────────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────────────
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(
    null,
  );
  const [actionItem, setActionItem] = useState<PayrollPeriod | null>(null);
  const [formDialog, setFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ──────────────────────────────────────────────────────────────────
  // MENU
  // ──────────────────────────────────────────────────────────────────
  const getMenuItems = (p: PayrollPeriod | null): MenuItem[] => {
    if (!p) return [];
    const canDelete = p.status === "Borrador";
    return [
      {
        label: "Editar",
        icon: "pi pi-pencil",
        command: () => editPeriod(p),
      },
      { separator: true },
      {
        label: "Eliminar",
        icon: "pi pi-trash",
        className: "p-menuitem-danger",
        disabled: !canDelete,
        command: () => confirmDeletePeriod(p),
      },
    ];
  };

  // ──────────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────────
  const openNew = () => {
    setSelectedPeriod(null);
    setFormDialog(true);
  };

  const editPeriod = (p: PayrollPeriod) => {
    setSelectedPeriod(p);
    setFormDialog(true);
  };

  const confirmDeletePeriod = (p: PayrollPeriod) => {
    setSelectedPeriod(p);
    setDeleteDialog(true);
  };

  const hideFormDialog = () => {
    setSelectedPeriod(null);
    setFormDialog(false);
  };

  const handleSave = async () => {
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: selectedPeriod?.id
        ? "Período actualizado correctamente"
        : "Período creado correctamente",
      life: 3000,
    });
    await mutate();
    hideFormDialog();
  };

  const handleDelete = async () => {
    if (!selectedPeriod?.id) return;
    try {
      setIsDeleting(true);
      await deletePayrollPeriod(selectedPeriod.id);
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Período eliminado",
        life: 3000,
      });
      setDeleteDialog(false);
      setSelectedPeriod(null);
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setIsDeleting(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────
  // ACTION COLUMN
  // ──────────────────────────────────────────────────────────────────
  const actionBodyTemplate = (rowData: PayrollPeriod) => (
    <i
      className="pi pi-cog cursor-pointer text-primary"
      onClick={(e: any) => {
        setActionItem(rowData);
        menuRef.current?.toggle(e);
      }}
      style={{ fontSize: "1.2rem" }}
      title="Opciones"
    />
  );

  return (
    <>
      <Toast ref={toast} />

      {/* Context menu */}
      <Menu
        model={getMenuItems(actionItem)}
        popup
        ref={menuRef}
        id="period-menu"
      />

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* TABLE */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <DataTable
        value={payrollPeriods}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        dataKey="id"
        scrollable
        sortMode="multiple"
        header={
          <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <div className="flex align-items-center gap-2">
              <h4 className="m-0">Períodos de Nómina</h4>
              <span className="text-600 text-sm">({total} total)</span>
            </div>
            <div className="flex gap-2">
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  type="search"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </span>
              <CreateButton label="Nuevo Período" onClick={openNew} />
            </div>
          </div>
        }
        emptyMessage="Sin períodos de nómina"
      >
        <Column field="name" header="Nombre" sortable />
        <Column field="frequency" header="Frecuencia" sortable />
        <Column
          field="startDate"
          header="Inicio"
          body={(r) => formatDate(r.startDate)}
          sortable
        />
        <Column
          field="endDate"
          header="Fin"
          body={(r) => formatDate(r.endDate)}
          sortable
        />
        <Column
          field="paymentDate"
          header="Fecha de Pago"
          body={(r) => formatDate(r.paymentDate)}
          sortable
        />
        <Column field="status" header="Estado" body={statusTemplate} sortable />
        <Column
          header="Acciones"
          body={actionBodyTemplate}
          style={{ width: "5rem", textAlign: "center" }}
        />
      </DataTable>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* FORM DIALOG */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <Dialog
        visible={formDialog}
        style={{ width: "700px" }}
        header={selectedPeriod ? "Editar Período" : "Nuevo Período de Nómina"}
        modal
        className="p-fluid"
        footer={
          <FormActionButtons
            formId="payroll-period-form"
            isSubmitting={isSubmitting}
            onCancel={hideFormDialog}
          />
        }
        onHide={hideFormDialog}
      >
        <PayrollPeriodForm
          period={selectedPeriod}
          onSave={handleSave}
          onSubmittingChange={setIsSubmitting}
          toast={toast}
        />
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* DELETE CONFIRM */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <DeleteConfirmDialog
        visible={deleteDialog}
        onHide={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        itemName={
          selectedPeriod
            ? `¿Confirmas la eliminación del período "${selectedPeriod.name}"?`
            : "¿Confirmas la eliminación?"
        }
      />
    </>
  );
}
