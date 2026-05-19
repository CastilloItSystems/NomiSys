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
import AttendanceForm from "./AttendanceForm";
import { useAttendanceData } from "../hooks/useAttendanceData";
import { deleteAttendance } from "../services/attendance.service";
import { Attendance } from "../interfaces/attendance.interface";
import { handleFormError } from "@/utils/errorHandlers";

const STATUS_SEVERITY: Record<string, any> = {
  Presente: "success",
  Ausente: "danger",
  Tardanza: "warning",
  Permiso: "info",
  Vacaciones: "info",
  Feriado: "secondary",
};

export default function AttendanceList() {
  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);
  const { attendance, total, loading, mutate } = useAttendanceData();
  const [selected, setSelected] = useState<Attendance | null>(null);
  const [actionItem, setActionItem] = useState<Attendance | null>(null);
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
      await deleteAttendance(selected.id);
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
      detail: "Asistencia registrada",
      life: 3000,
    });
    await mutate();
    setFormDialog(false);
    setSelected(null);
  };

  return (
    <>
      <Toast ref={toast} />
      <Menu ref={menuRef} model={menuItems} popup />
      <DataTable
        value={attendance}
        loading={loading}
        paginator
        rows={15}
        dataKey="id"
        scrollable
        header={
          <div className="flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h4 className="m-0">Asistencia</h4>
              <span className="text-600 text-sm">({total} total)</span>
            </div>
            <CreateButton
              label="Registrar Asistencia"
              onClick={() => {
                setSelected(null);
                setFormDialog(true);
              }}
            />
          </div>
        }
        emptyMessage="Sin registros de asistencia"
      >
        <Column field="date" header="Fecha" sortable />
        <Column field="employeeId" header="Empleado" />
        <Column
          field="status"
          header="Estado"
          body={(row) => (
            <Tag value={row.status} severity={STATUS_SEVERITY[row.status]} />
          )}
        />
        <Column
          field="checkIn"
          header="Entrada"
          body={(row) =>
            row.checkIn ? new Date(row.checkIn).toLocaleTimeString() : "-"
          }
        />
        <Column
          field="checkOut"
          header="Salida"
          body={(row) =>
            row.checkOut ? new Date(row.checkOut).toLocaleTimeString() : "-"
          }
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
        header={selected?.id ? "Editar Asistencia" : "Registrar Asistencia"}
        visible={formDialog}
        onHide={() => {
          setFormDialog(false);
          setSelected(null);
        }}
        style={{ width: "520px" }}
        modal
      >
        <AttendanceForm
          attendance={selected}
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
        itemName="¿Eliminar este registro de asistencia?"
      />
    </>
  );
}
