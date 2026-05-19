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
import LeaveRequestForm from "./LeaveRequestForm";
import { useLeaveRequestsData } from "../hooks/useLeaveRequestsData";
import {
  deleteLeaveRequest,
  approveLeaveRequest,
} from "../services/leaveRequest.service";
import { LeaveRequest } from "../interfaces/leaveRequest.interface";
import { handleFormError } from "@/utils/errorHandlers";

const STATUS_SEVERITY: Record<string, any> = {
  Pendiente: "warning",
  Aprobado: "success",
  Rechazado: "danger",
  Cancelado: "secondary",
};

export default function LeaveRequestsList() {
  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);
  const { requests, total, loading, mutate } = useLeaveRequestsData();
  const [actionItem, setActionItem] = useState<LeaveRequest | null>(null);
  const [formDialog, setFormDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getMenuItems = (item: LeaveRequest | null): MenuItem[] => {
    if (!item || item.status !== "Pendiente") return [];
    return [
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
      { separator: true },
      {
        label: "Cancelar",
        icon: "pi pi-ban",
        className: "p-menuitem-danger",
        command: () => handleCancel(item),
      },
    ];
  };

  const handleApprove = async (
    item: LeaveRequest,
    status: "Aprobado" | "Rechazado",
  ) => {
    try {
      await approveLeaveRequest(item.id, status);
      toast.current?.show({
        severity: status === "Aprobado" ? "success" : "info",
        summary: status,
        detail: `Solicitud ${status.toLowerCase()}`,
        life: 3000,
      });
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    }
  };

  const handleCancel = async (item: LeaveRequest) => {
    try {
      await deleteLeaveRequest(item.id);
      toast.current?.show({
        severity: "info",
        summary: "Cancelado",
        detail: "Solicitud cancelada",
        life: 3000,
      });
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    }
  };

  const handleSave = async () => {
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: "Solicitud de permiso creada",
      life: 3000,
    });
    await mutate();
    setFormDialog(false);
  };

  return (
    <>
      <Toast ref={toast} />
      <Menu ref={menuRef} model={getMenuItems(actionItem)} popup />
      <DataTable
        value={requests}
        loading={loading}
        paginator
        rows={10}
        dataKey="id"
        scrollable
        header={
          <div className="flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h4 className="m-0">Solicitudes de Permiso</h4>
              <span className="text-600 text-sm">({total} total)</span>
            </div>
            <CreateButton
              label="Nueva Solicitud"
              onClick={() => setFormDialog(true)}
            />
          </div>
        }
        emptyMessage="Sin solicitudes de permiso"
      >
        <Column field="employeeId" header="Empleado" />
        <Column field="type" header="Tipo" />
        <Column field="startDate" header="Desde" sortable />
        <Column field="endDate" header="Hasta" />
        <Column field="days" header="Días" />
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
        header="Nueva Solicitud de Permiso"
        visible={formDialog}
        onHide={() => setFormDialog(false)}
        style={{ width: "500px" }}
        modal
      >
        <LeaveRequestForm
          onSave={handleSave}
          onCancel={() => setFormDialog(false)}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      </Dialog>
    </>
  );
}
