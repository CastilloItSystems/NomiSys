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
import ContractTypeForm from "./ContractTypeForm";
import { useContractTypesData } from "../hooks/useContractTypesData";
import { deleteContractType } from "../services/contractType.service";
import { ContractType } from "../interfaces/contractType.interface";
import { handleFormError } from "@/utils/errorHandlers";

export default function ContractTypesList() {
  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);
  const { contractTypes, total, loading, mutate } = useContractTypesData();
  const [selected, setSelected] = useState<ContractType | null>(null);
  const [actionItem, setActionItem] = useState<ContractType | null>(null);
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
      label: "Desactivar",
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
      await deleteContractType(selected.id);
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Tipo de contrato desactivado",
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
      detail: selected?.id ? "Actualizado" : "Creado",
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
        value={contractTypes}
        loading={loading}
        paginator
        rows={10}
        dataKey="id"
        scrollable
        header={
          <div className="flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h4 className="m-0">Tipos de Contrato</h4>
              <span className="text-600 text-sm">({total} total)</span>
            </div>
            <CreateButton
              label="Nuevo Tipo"
              onClick={() => {
                setSelected(null);
                setFormDialog(true);
              }}
            />
          </div>
        }
        emptyMessage="Sin tipos de contrato"
      >
        <Column field="name" header="Nombre" sortable />
        <Column field="description" header="Descripción" />
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
        header={selected?.id ? "Editar Tipo" : "Nuevo Tipo de Contrato"}
        visible={formDialog}
        onHide={() => {
          setFormDialog(false);
          setSelected(null);
        }}
        style={{ width: "450px" }}
        modal
      >
        <ContractTypeForm
          contractType={selected}
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
        itemName={`¿Desactivar tipo "${selected?.name}"?`}
      />
    </>
  );
}
