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
import BankForm from "./BankForm";
import { useBanksData } from "@/modules/nomina/banks/hooks/useBanksData";
import { deleteBank } from "@/modules/nomina/banks/services/bank.service";
import { Bank } from "@/modules/nomina/banks/interfaces/bank.interface";
import { handleFormError } from "@/utils/errorHandlers";

export default function BanksList() {
  // ──────────────────────────────────────────────────────────────────
  // REFS & HOOKS
  // ──────────────────────────────────────────────────────────────────
  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { banks, total, loading, mutate } = useBanksData(
    searchQuery || undefined,
  );

  // ──────────────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────────────
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [actionItem, setActionItem] = useState<Bank | null>(null);
  const [bankFormDialog, setBankFormDialog] = useState(false);
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
  const getMenuItems = (b: Bank | null): MenuItem[] => {
    if (!b) return [];
    return [
      {
        label: "Editar",
        icon: "pi pi-pencil",
        command: () => editBank(b),
      },
      {
        separator: true,
      },
      {
        label: "Eliminar",
        icon: "pi pi-trash",
        className: "p-menuitem-danger",
        command: () => confirmDeleteBank(b),
      },
    ];
  };

  // ──────────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────────
  const editBank = (b: Bank) => {
    setSelectedBank(b);
    setBankFormDialog(true);
  };

  const confirmDeleteBank = (b: Bank) => {
    setSelectedBank(b);
    setDeleteDialog(true);
  };

  const deleteB = async () => {
    if (!selectedBank?.id) return;
    try {
      setIsDeleting(true);
      await deleteBank(selectedBank.id);
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Banco eliminado",
        life: 3000,
      });
      setDeleteDialog(false);
      setSelectedBank(null);
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setIsDeleting(false);
    }
  };

  const hideFormDialog = () => {
    setSelectedBank(null);
    setBankFormDialog(false);
  };

  const handleSave = async () => {
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: selectedBank?.id
        ? "Banco actualizado correctamente"
        : "Banco creado correctamente",
      life: 3000,
    });
    await mutate();
    hideFormDialog();
  };

  const openNew = () => {
    setSelectedBank(null);
    setBankFormDialog(true);
  };

  // ──────────────────────────────────────────────────────────────────
  // ACTION TEMPLATE
  // ──────────────────────────────────────────────────────────────────
  const actionBodyTemplate = (rowData: Bank) => {
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
        value={banks}
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
              <h4 className="m-0">Bancos</h4>
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
              <CreateButton label="Nuevo Banco" onClick={openNew} />
            </div>
          </div>
        }
        emptyMessage="Sin bancos"
      >
        <Column field="name" header="Nombre" sortable />
        <Column field="code" header="Código SUDEBAN" sortable />
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
        id="bank-menu"
        model={getMenuItems(actionItem)}
        popup
      />

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* DIALOG: CREATE/EDIT FORM */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <Dialog
        visible={bankFormDialog}
        modal
        maximizable
        style={{ width: "75vw" }}
        breakpoints={{ "1400px": "75vw", "900px": "85vw", "600px": "95vw" }}
        onHide={hideFormDialog}
        header={
          <div className="mb-2 text-center md:text-left">
            <div className="border-bottom-2 border-primary pb-2">
              <h2 className="text-2xl font-bold text-900 mb-2 flex align-items-center justify-content-center md:justify-content-start">
                <i className="pi pi-building mr-3 text-primary text-3xl"></i>
                {selectedBank ? "Editar Banco" : "Nuevo Banco"}
              </h2>
            </div>
          </div>
        }
        footer={
          <FormActionButtons
            formId="bank-form"
            isUpdate={!!selectedBank?.id}
            onCancel={hideFormDialog}
            isSubmitting={isSubmitting}
          />
        }
      >
        <BankForm
          bank={selectedBank}
          onSave={handleSave}
          formId="bank-form"
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
          setSelectedBank(null);
        }}
        onConfirm={deleteB}
        itemName={selectedBank?.name}
        isDeleting={isDeleting}
      />
    </>
  );
}
