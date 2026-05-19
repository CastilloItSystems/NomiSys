"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import CreateButton from "@/shared/components/CreateButton";
import DeleteConfirmDialog from "@/shared/components/DeleteConfirmDialog";
import RunInputsDialog from "./RunInputsDialog";
import { usePayrollRunsData } from "../hooks/usePayrollRunsData";
import { usePayrollPeriodsData } from "@/modules/nomina/payroll-periods/hooks/usePayrollPeriodsData";
import {
  processPayrollRun,
  approvePayrollRun,
  payPayrollRun,
  deletePayrollRun,
  createPayrollRun,
} from "../services/payrollRun.service";
import { PayrollRun, PayrollRunType } from "../interfaces/payrollRun.interface";
import { handleFormError } from "@/utils/errorHandlers";

const STATUS_SEVERITY: Record<string, any> = {
  Borrador: "secondary",
  Procesando: "warning",
  Procesado: "info",
  Aprobado: "success",
  Pagado: "success",
  Anulado: "danger",
};

const RUN_TYPE_OPTIONS: {
  label: string;
  value: PayrollRunType;
  description: string;
}[] = [
  {
    label: "Regular",
    value: "Regular",
    description: "Nómina ordinaria del período",
  },
  {
    label: "Utilidades",
    value: "Utilidades",
    description: "Pago de utilidades anuales (mín. 15 días)",
  },
  {
    label: "Vacaciones Especiales",
    value: "VacacionesEspeciales",
    description: "Pago de bono vacacional",
  },
  {
    label: "Prestaciones Sociales",
    value: "PrestacionesSociales",
    description: "Liquidación de garantía trimestral",
  },
];

export default function PayrollRunsList() {
  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);
  const router = useRouter();
  const { runs, total, loading, mutate } = usePayrollRunsData();
  const { payrollPeriods, loading: periodsLoading } = usePayrollPeriodsData(
    undefined,
    "Abierto",
  );
  const [selected, setSelected] = useState<PayrollRun | null>(null);
  const [actionItem, setActionItem] = useState<PayrollRun | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPeriodId, setNewPeriodId] = useState("");
  const [newRunType, setNewRunType] = useState<PayrollRunType>("Regular");
  const [newNotes, setNewNotes] = useState("");
  const [createDialog, setCreateDialog] = useState(false);
  const [inputsDialogRun, setInputsDialogRun] = useState<PayrollRun | null>(
    null,
  );

  const periodOptions = payrollPeriods.map((p) => ({
    label: `${p.name} (${p.frequency})`,
    value: p.id,
  }));

  const getMenuItems = (run: PayrollRun | null): MenuItem[] => {
    if (!run) return [];
    const items: MenuItem[] = [];
    items.push({
      label: "Abrir Editor",
      icon: "pi pi-file-edit",
      command: () => router.push(`/empresa/nomina/calculo/${run.id}`),
    });
    items.push({ separator: true });
    if (["Borrador", "Procesado"].includes(run.status)) {
      items.push({
        label: "Procesar Nómina",
        icon: "pi pi-cog",
        command: () => handleProcess(run),
      });
    }
    if (run.status === "Procesado") {
      items.push({
        label: "Aprobar",
        icon: "pi pi-check",
        command: () => handleApprove(run),
      });
    }
    if (run.status === "Aprobado") {
      items.push({
        label: "Marcar como Pagado",
        icon: "pi pi-money-bill",
        command: () => handlePay(run),
      });
    }
    if (!["Pagado", "Aprobado"].includes(run.status)) {
      items.push(
        { separator: true },
        {
          label: "Anular",
          icon: "pi pi-times",
          className: "p-menuitem-danger",
          command: () => {
            setSelected(run);
            setDeleteDialog(true);
          },
        },
      );
    }
    return items;
  };

  const handleProcess = async (run: PayrollRun) => {
    // Open inputs dialog before processing
    setInputsDialogRun(run);
  };

  const doProcess = async (run: PayrollRun) => {
    try {
      await processPayrollRun(run.id);
      toast.current?.show({
        severity: "success",
        summary: "Procesado",
        detail: "Nómina calculada exitosamente",
        life: 3000,
      });
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    }
  };

  const handleApprove = async (run: PayrollRun) => {
    try {
      await approvePayrollRun(run.id);
      toast.current?.show({
        severity: "success",
        summary: "Aprobado",
        detail: "Nómina aprobada",
        life: 3000,
      });
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    }
  };

  const handlePay = async (run: PayrollRun) => {
    try {
      await payPayrollRun(run.id);
      toast.current?.show({
        severity: "success",
        summary: "Pagado",
        detail: "Nómina marcada como pagada",
        life: 3000,
      });
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    }
  };

  const handleDelete = async () => {
    if (!selected?.id) return;
    try {
      setIsDeleting(true);
      await deletePayrollRun(selected.id);
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Nómina anulada",
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

  const handleCreate = async () => {
    if (!newPeriodId) return;
    try {
      setCreating(true);
      await createPayrollRun({
        periodId: newPeriodId,
        runType: newRunType,
        notes: newNotes || undefined,
      });
      toast.current?.show({
        severity: "success",
        summary: "Creado",
        detail: "Cálculo de nómina creado",
        life: 3000,
      });
      setCreateDialog(false);
      setNewPeriodId("");
      setNewRunType("Regular");
      setNewNotes("");
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setCreating(false);
    }
  };

  const fmt = (v: number) =>
    v
      ? `$${Number(v).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`
      : "$0.00";

  const runTypeLabel: Record<PayrollRunType, string> = {
    Regular: "Regular",
    Utilidades: "Utilidades",
    VacacionesEspeciales: "Vac. Especiales",
    PrestacionesSociales: "Prestaciones",
  };

  return (
    <>
      <Toast ref={toast} />
      <Menu ref={menuRef} model={getMenuItems(actionItem)} popup />
      <DataTable
        value={runs}
        loading={loading}
        paginator
        rows={10}
        dataKey="id"
        scrollable
        onRowDoubleClick={(e) =>
          router.push(`/empresa/nomina/calculo/${(e.data as PayrollRun).id}`)
        }
        rowClassName={() => "cursor-pointer"}
        header={
          <div className="flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h4 className="m-0">Cálculos de Nómina</h4>
              <span className="text-600 text-sm">({total} total)</span>
            </div>
            <CreateButton
              label="Nuevo Cálculo"
              onClick={() => setCreateDialog(true)}
            />
          </div>
        }
        emptyMessage="Sin cálculos de nómina"
      >
        <Column field="periodId" header="Período" />
        <Column
          field="runType"
          header="Tipo"
          body={(row: PayrollRun) => (
            <span className="text-sm font-medium">
              {runTypeLabel[row.runType] ?? row.runType}
            </span>
          )}
        />
        <Column
          field="status"
          header="Estado"
          body={(row: PayrollRun) => (
            <Tag value={row.status} severity={STATUS_SEVERITY[row.status]} />
          )}
        />
        <Column field="employeeCount" header="Empleados" align="center" />
        <Column
          field="totalGross"
          header="Bruto Total"
          body={(row: PayrollRun) => fmt(row.totalGross)}
        />
        <Column
          field="totalDeductions"
          header="Deducciones"
          body={(row: PayrollRun) => fmt(row.totalDeductions)}
        />
        <Column
          field="totalNet"
          header="Neto Total"
          body={(row: PayrollRun) => <strong>{fmt(row.totalNet)}</strong>}
        />
        <Column
          body={(row: PayrollRun) => (
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
        header="Nuevo Cálculo de Nómina"
        visible={createDialog}
        onHide={() => setCreateDialog(false)}
        style={{ width: "480px" }}
        modal
      >
        <div className="flex flex-column gap-3 p-2">
          <div className="field">
            <label className="font-medium">Tipo de Cálculo *</label>
            <Dropdown
              value={newRunType}
              options={RUN_TYPE_OPTIONS}
              onChange={(e) => setNewRunType(e.value)}
              optionLabel="label"
              optionValue="value"
              itemTemplate={(opt) => (
                <div>
                  <div className="font-medium">{opt.label}</div>
                  <small className="text-500">{opt.description}</small>
                </div>
              )}
              className="w-full"
            />
          </div>
          <div className="field">
            <label className="font-medium">Período *</label>
            <Dropdown
              value={newPeriodId}
              options={periodOptions}
              onChange={(e) => setNewPeriodId(e.value)}
              loading={periodsLoading}
              placeholder="Seleccione un período abierto..."
              className="w-full"
              emptyMessage="No hay períodos abiertos. Cree uno en Períodos de Nómina."
            />
          </div>
          <div className="field">
            <label className="font-medium">Observaciones</label>
            <InputTextarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={2}
              className="w-full"
              placeholder="Opcional..."
            />
          </div>
          <div className="flex gap-2 justify-content-end">
            <Button
              label="Cancelar"
              severity="secondary"
              outlined
              onClick={() => setCreateDialog(false)}
            />
            <Button
              label="Crear"
              icon="pi pi-check"
              onClick={handleCreate}
              loading={creating}
              disabled={!newPeriodId}
            />
          </div>
        </div>
      </Dialog>

      <DeleteConfirmDialog
        visible={deleteDialog}
        onHide={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        itemName="¿Anular este cálculo de nómina?"
      />

      {inputsDialogRun && (
        <RunInputsDialog
          runId={inputsDialogRun.id}
          visible={!!inputsDialogRun}
          onHide={() => setInputsDialogRun(null)}
          onSaved={() => {
            const run = inputsDialogRun;
            setInputsDialogRun(null);
            doProcess(run);
          }}
        />
      )}
    </>
  );
}
