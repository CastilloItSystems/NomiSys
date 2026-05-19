"use client";

import { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import { Tag } from "primereact/tag";
import CreateButton from "@/shared/components/CreateButton";
import DeleteConfirmDialog from "@/shared/components/DeleteConfirmDialog";
import OvertimeForm from "./OvertimeForm";
import { useOvertimeData } from "../hooks/useOvertimeData";
import { deleteOvertime, approveOvertime } from "../services/overtime.service";
import { Overtime } from "../interfaces/overtime.interface";
import { handleFormError } from "@/utils/errorHandlers";

const STATUS_SEVERITY: Record<string, any> = {
  Pendiente: "warning",
  Aprobado: "success",
  Rechazado: "danger",
};

export default function OvertimeList() {
  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);
  const { overtime, total, loading, mutate } = useOvertimeData();
  const [selected, setSelected] = useState<Overtime | null>(null);
  const [actionItem, setActionItem] = useState<Overtime | null>(null);
  const [formDialog, setFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getMenuItems = (item: Overtime | null): MenuItem[] => {
    if (!item) return [];
    const items: MenuItem[] = [
      {
        label: "Editar",
        icon: "pi pi-pencil",
        command: () => {
          setSelected(item);
          setFormDialog(true);
        },
      },
    ];
    if (item.status === "Pendiente") {
      items.push(
        {
          label: "Aprobar",
          icon: "pi pi-check text-green-500",
          command: () => handleApprove(item, "Aprobado"),
        },
        {
          label: "Rechazar",
          icon: "pi pi-times text-red-500",
          command: () => handleApprove(item, "Rechazado"),
        },
      );
    }
    items.push(
      { separator: true },
      {
        label: "Eliminar",
        icon: "pi pi-trash",
        className: "p-menuitem-danger",
        command: () => {
          setSelected(item);
          setDeleteDialog(true);
        },
      },
    );
    return items;
  };

  const handleApprove = async (
    item: Overtime,
    status: "Aprobado" | "Rechazado",
  ) => {
    try {
      await approveOvertime(item.id, status);
      toast.current?.show({
        severity: status === "Aprobado" ? "success" : "info",
        summary: status,
        detail: `Hora extra ${status.toLowerCase()}`,
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
      await deleteOvertime(selected.id);
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Registro eliminado",
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
      detail: "Hora extra registrada",
      life: 3000,
    });
    await mutate();
    setFormDialog(false);
    setSelected(null);
  };

  return (
    <>
      <Toast ref={toast} />
      <Menu ref={menuRef} model={getMenuItems(actionItem)} popup />
      <DataTable
        value={overtime}
        loading={loading}
        paginator
        rows={15}
        dataKey="id"
        scrollable
        header={
          <div className="flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h4 className="m-0">Horas Extra</h4>
              <span className="text-600 text-sm">({total} total)</span>
            </div>
            <CreateButton
              label="Registrar Hora Extra"
              onClick={() => {
                setSelected(null);
                setFormDialog(true);
              }}
            />
          </div>
        }
        emptyMessage="Sin horas extra"
      >
        <Column field="date" header="Fecha" sortable />
        <Column field="employeeId" header="Empleado" />
        <Column field="hours" header="Horas" />
        <Column field="type" header="Tipo" />
        <Column
          field="status"
          header="Estado"
          body={(row) => (
            <Tag value={row.status} severity={STATUS_SEVERITY[row.status]} />
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
        header={selected?.id ? "Editar Hora Extra" : "Registrar Hora Extra"}
        visible={formDialog}
        onHide={() => {
          setFormDialog(false);
          setSelected(null);
        }}
        style={{ width: "500px" }}
        modal
      >
        <OvertimeForm
          overtime={selected}
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
        itemName="¿Eliminar este registro de hora extra?"
      />
    </>
  );
}
