"use client";

import { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import { classNames } from "primereact/utils";
import CreateButton from "@/shared/components/CreateButton";
import DeleteConfirmDialog from "@/shared/components/DeleteConfirmDialog";
import FormActionButtons from "@/shared/components/FormActionButtons";
import PositionForm from "./PositionForm";
import { usePositionsData } from "@/modules/nomina/positions/hooks/usePositionsData";
import { deletePosition } from "@/modules/nomina/positions/services/position.service";
import { Position } from "@/modules/nomina/positions/interfaces/position.interface";
import { handleFormError } from "@/utils/errorHandlers";

export default function PositionsList() {
  // ──────────────────────────────────────────────────────────────────
  // REFS & HOOKS
  // ──────────────────────────────────────────────────────────────────
  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { positions, total, loading, mutate } = usePositionsData(
    searchQuery || undefined,
  );

  // ──────────────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────────────
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null,
  );
  const [actionItem, setActionItem] = useState<Position | null>(null);
  const [positionFormDialog, setPositionFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ──────────────────────────────────────────────────────────────────
  // SEARCH HANDLER
  // ──────────────────────────────────────────────────────────────────
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // ──────────────────────────────────────────────────────────────────
  // MENU ITEMS
  // ──────────────────────────────────────────────────────────────────
  const getMenuItems = (pos: Position | null): MenuItem[] => {
    if (!pos) return [];
    return [
      {
        label: "Editar",
        icon: "pi pi-pencil",
        command: () => editPosition(pos),
      },
      {
        separator: true,
      },
      {
        label: "Eliminar",
        icon: "pi pi-trash",
        className: "p-menuitem-danger",
        command: () => confirmDeletePosition(pos),
      },
    ];
  };

  // ──────────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────────
  const editPosition = (pos: Position) => {
    setSelectedPosition(pos);
    setPositionFormDialog(true);
  };

  const confirmDeletePosition = (pos: Position) => {
    setSelectedPosition(pos);
    setDeleteDialog(true);
  };

  const deletePos = async () => {
    if (!selectedPosition?.id) return;
    try {
      setIsDeleting(true);
      await deletePosition(selectedPosition.id);
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Cargo eliminado",
        life: 3000,
      });
      setDeleteDialog(false);
      setSelectedPosition(null);
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setIsDeleting(false);
    }
  };

  const hideFormDialog = () => {
    setSelectedPosition(null);
    setPositionFormDialog(false);
  };

  const handleSave = async () => {
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: selectedPosition?.id
        ? "Cargo actualizado correctamente"
        : "Cargo creado correctamente",
      life: 3000,
    });
    await mutate();
    hideFormDialog();
  };

  const openNew = () => {
    setSelectedPosition(null);
    setPositionFormDialog(true);
  };

  // ──────────────────────────────────────────────────────────────────
  // ACTION TEMPLATE
  // ──────────────────────────────────────────────────────────────────
  const actionBodyTemplate = (rowData: Position) => {
    return (
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
  };

  return (
    <>
      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* NOTIFICATIONS & STATE */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <Toast ref={toast} />

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* DATATABLE: LIST VIEW */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <DataTable
        value={positions}
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
              <h4 className="m-0">Cargos</h4>
              <span className="text-600 text-sm">({total} total)</span>
            </div>
            <div className="flex gap-2">
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  type="search"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </span>
              <CreateButton label="Nuevo Cargo" onClick={openNew} />
            </div>
          </div>
        }
        emptyMessage="Sin cargos"
      >
        <Column field="name" header="Nombre" sortable />
        <Column field="code" header="Código" sortable />
        <Column field="level" header="Nivel" sortable />
        <Column
          field="isActive"
          header="Activo"
          body={(rowData) => (
            <i
              className={classNames("pi", {
                "text-green-500 pi-check": rowData.isActive,
                "text-gray-400 pi-times": !rowData.isActive,
              })}
            />
          )}
        />
        <Column
          header="Acciones"
          body={actionBodyTemplate}
          exportable={false}
          frozen={true}
          alignFrozen="right"
          style={{ width: "6rem", textAlign: "center" }}
          headerStyle={{ textAlign: "center" }}
        />
      </DataTable>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* CONTEXT MENU: FLOATING ACTIONS */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <Menu
        ref={menuRef}
        id="position-menu"
        model={getMenuItems(actionItem)}
        popup
      />

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* DIALOG: CREATE/EDIT FORM */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <Dialog
        visible={positionFormDialog}
        modal
        maximizable
        style={{ width: "75vw" }}
        breakpoints={{ "1400px": "75vw", "900px": "85vw", "600px": "95vw" }}
        onHide={hideFormDialog}
        header={
          <div className="mb-2 text-center md:text-left">
            <div className="border-bottom-2 border-primary pb-2">
              <h2 className="text-2xl font-bold text-900 mb-2 flex align-items-center justify-content-center md:justify-content-start">
                <i className="pi pi-briefcase mr-3 text-primary text-3xl"></i>
                {selectedPosition ? "Editar Cargo" : "Nuevo Cargo"}
              </h2>
            </div>
          </div>
        }
        footer={
          <FormActionButtons
            formId="position-form"
            isUpdate={!!selectedPosition?.id}
            onCancel={hideFormDialog}
            isSubmitting={isSubmitting}
          />
        }
      >
        <PositionForm
          position={selectedPosition}
          onSave={handleSave}
          formId="position-form"
          onSubmittingChange={setIsSubmitting}
          toast={toast}
        />
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* DIALOG: DELETE CONFIRMATION */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <DeleteConfirmDialog
        visible={deleteDialog}
        onHide={() => {
          setDeleteDialog(false);
          setSelectedPosition(null);
        }}
        onConfirm={deletePos}
        itemName={selectedPosition?.name}
        isDeleting={isDeleting}
      />
    </>
  );
}
