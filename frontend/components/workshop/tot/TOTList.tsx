"use client";
import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { motion } from "framer-motion";
import CreateButton from "@/components/common/CreateButton";
import { handleFormError } from "@/utils/errorHandlers";
import { totService } from "@/app/api/workshop";
import type { WorkshopTOT, TOTStatus } from "@/libs/interfaces/workshop";
import TOTStatusBadge, {
  TOT_STATUS_LABELS,
} from "./TOTStatusBadge";
import TOTForm from "./TOTForm";

interface Props {
  serviceOrderId?: string;
  embedded?: boolean;
}

const STATUS_OPTIONS = Object.entries(TOT_STATUS_LABELS).map(
  ([value, label]) => ({ label, value })
);

const VALID_TRANSITIONS: Record<TOTStatus, TOTStatus[]> = {
  REQUESTED: ["APPROVED", "CANCELLED"],
  APPROVED: ["DEPARTED", "CANCELLED"],
  DEPARTED: ["IN_PROGRESS", "RETURNED"],
  IN_PROGRESS: ["RETURNED", "CANCELLED"],
  RETURNED: ["INVOICED"],
  INVOICED: [],
  CANCELLED: [],
};

export default function TOTList({ serviceOrderId, embedded }: Props) {
  const [items, setItems] = useState<WorkshopTOT[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selected, setSelected] = useState<WorkshopTOT | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TOTStatus | undefined>();
  const [supplierId] = useState<string | undefined>();
  const [page, setPage] = useState(0);
  const [rows] = useState(20);
  const [loading, setLoading] = useState(true);
  const [formDialog, setFormDialog] = useState(false);
  const [editItem, setEditItem] = useState<WorkshopTOT | null>(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<TOTStatus | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useRef<Toast>(null);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await totService.getAll({
        serviceOrderId: serviceOrderId || undefined,
        status: statusFilter,
        supplierId: supplierId || undefined,
        search: searchQuery || undefined,
        page: page + 1,
        limit: rows,
      });
      setItems(res.data ?? []);
      setTotalRecords(res.meta?.total ?? 0);
    } catch (error) {
      handleFormError(error, toast);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (embedded && !serviceOrderId) return;
    setPage(0);
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceOrderId, statusFilter, searchQuery, embedded]);

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSaved = () => {
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: editItem ? "T.O.T. actualizado" : "T.O.T. creado",
      life: 3000,
    });
    loadItems();
    setFormDialog(false);
    setEditItem(null);
  };

  const openEdit = (item: WorkshopTOT) => {
    setEditItem(item);
    setFormDialog(true);
  };

  const openStatusChange = (item: WorkshopTOT) => {
    setSelected(item);
    setNewStatus(undefined);
    setStatusDialog(true);
  };

  const handleStatusChange = async () => {
    if (!selected || !newStatus) return;
    setIsSubmitting(true);
    try {
      await totService.updateStatus(selected.id, newStatus);
      toast.current?.show({
        severity: "success",
        summary: "Estado actualizado",
        life: 3000,
      });
      loadItems();
      setStatusDialog(false);
      setSelected(null);
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: WorkshopTOT) => {
    if (!confirm(`¿Eliminar T.O.T. ${item.totNumber}?`)) return;
    try {
      await totService.remove(item.id);
      toast.current?.show({
        severity: "success",
        summary: "T.O.T. eliminado",
        life: 3000,
      });
      loadItems();
    } catch (error) {
      handleFormError(error, toast);
    }
  };

  // ── Column Templates ────────────────────────────────────────────────────────

  const numberTemplate = (row: WorkshopTOT) => (
    <span className="font-bold text-primary">{row.totNumber}</span>
  );

  const statusTemplate = (row: WorkshopTOT) => (
    <TOTStatusBadge status={row.status} />
  );

  const orderTemplate = (row: WorkshopTOT) =>
    row.serviceOrder ? (
      <span className="font-semibold">{row.serviceOrder.folio}</span>
    ) : (
      <span className="text-500 text-sm">{row.serviceOrderId.slice(0, 8)}…</span>
    );

  const providerTemplate = (row: WorkshopTOT) =>
    row.supplier?.name ?? row.providerName ?? (
      <span className="text-500 text-sm italic">Sin proveedor</span>
    );

  const costTemplate = (row: WorkshopTOT) =>
    row.finalCost != null ? (
      <span className="font-semibold">
        {Number(row.finalCost).toLocaleString("es-VE", {
          style: "currency",
          currency: "USD",
        })}
      </span>
    ) : row.providerQuote != null ? (
      <span className="text-500">
        ~{Number(row.providerQuote).toLocaleString("es-VE", {
          style: "currency",
          currency: "USD",
        })}
      </span>
    ) : (
      <span className="text-500 text-sm">—</span>
    );

  const actionsTemplate = (row: WorkshopTOT) => {
    const nextStatuses = VALID_TRANSITIONS[row.status];
    return (
      <div className="flex gap-2">
        {nextStatuses.length > 0 && (
          <Button
            icon="pi pi-sync"
            size="small"
            severity="info"
            text
            tooltip="Cambiar estado"
            onClick={() => openStatusChange(row)}
          />
        )}
        {["REQUESTED"].includes(row.status) && (
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            text
            tooltip="Editar"
            onClick={() => openEdit(row)}
          />
        )}
        {["REQUESTED", "CANCELLED"].includes(row.status) && (
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            text
            tooltip="Eliminar"
            onClick={() => handleDelete(row)}
          />
        )}
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4"
    >
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <h2 className="text-2xl font-bold m-0">Servicios Externos (T.O.T.)</h2>
        <div className="flex gap-2 flex-wrap">
          {!embedded && (
            <>
              <InputText
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-15rem"
              />
              <Dropdown
                value={statusFilter}
                options={STATUS_OPTIONS}
                onChange={(e) => setStatusFilter(e.value)}
                placeholder="Todos los estados"
                showClear
                className="w-12rem"
              />
            </>
          )}
          <CreateButton
            label="Nuevo T.O.T."
            onClick={() => {
              setEditItem(null);
              setFormDialog(true);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        value={items}
        loading={loading}
        paginator
        lazy
        rows={rows}
        totalRecords={totalRecords}
        first={page * rows}
        onPage={(e) => setPage(e.page ?? 0)}
        emptyMessage="No hay T.O.T. registrados"
        stripedRows
        size="small"
        className="p-datatable-sm"
      >
        <Column body={numberTemplate} header="Número" style={{ width: "8rem" }} />
        {!embedded && (
          <Column body={orderTemplate} header="Orden de Servicio" />
        )}
        <Column body={providerTemplate} header="Proveedor" />
        <Column field="partDescription" header="Pieza" style={{ maxWidth: "16rem" }} />
        <Column body={statusTemplate} header="Estado" style={{ width: "9rem" }} />
        <Column body={costTemplate} header="Costo" style={{ width: "9rem" }} />
        <Column body={actionsTemplate} header="Acciones" style={{ width: "9rem" }} />
      </DataTable>

      {/* Form Dialog */}
      <Dialog
        header={editItem ? "Editar T.O.T." : "Nuevo T.O.T."}
        visible={formDialog}
        onHide={() => {
          setFormDialog(false);
          setEditItem(null);
        }}
        style={{ width: "60rem" }}
        maximizable
        modal
        draggable={false}
      >
        <TOTForm
          item={editItem}
          serviceOrderId={serviceOrderId}
          onSaved={handleSaved}
          onCancel={() => {
            setFormDialog(false);
            setEditItem(null);
          }}
        />
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog
        header={`Cambiar estado: ${selected?.totNumber}`}
        visible={statusDialog}
        onHide={() => setStatusDialog(false)}
        style={{ width: "28rem" }}
        modal
        draggable={false}
      >
        {selected && (
          <div className="flex flex-column gap-4 p-2">
            <p className="text-600 m-0">
              Estado actual:{" "}
              <TOTStatusBadge status={selected.status} />
            </p>
            <Dropdown
              value={newStatus}
              options={VALID_TRANSITIONS[selected.status].map((s) => ({
                label: TOT_STATUS_LABELS[s],
                value: s,
              }))}
              onChange={(e) => setNewStatus(e.value)}
              placeholder="Seleccionar nuevo estado"
              className="w-full"
            />
            <div className="flex gap-2 justify-content-end">
              <Button
                label="Cancelar"
                severity="secondary"
                outlined
                onClick={() => setStatusDialog(false)}
              />
              <Button
                label="Guardar"
                disabled={!newStatus || isSubmitting}
                loading={isSubmitting}
                onClick={handleStatusChange}
              />
            </div>
          </div>
        )}
      </Dialog>
    </motion.div>
  );
}
