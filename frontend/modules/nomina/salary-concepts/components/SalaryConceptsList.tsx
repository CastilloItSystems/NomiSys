"use client";

import { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import CreateButton from "@/shared/components/CreateButton";
import DeleteConfirmDialog from "@/shared/components/DeleteConfirmDialog";
import SalaryConceptForm from "./SalaryConceptForm";
import { useSalaryConceptsData } from "../hooks/useSalaryConceptsData";
import { deleteSalaryConcept, seedCCPConcepts } from "../services/salaryConcept.service";
import { SalaryConcept } from "../interfaces/salaryConcept.interface";
import { handleFormError } from "@/utils/errorHandlers";

const TYPE_SEVERITY: Record<string, any> = {
  Ingreso: "success",
  Deducción: "danger",
  "Aporte Patronal": "warning",
};

export default function SalaryConceptsList() {
  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);
  const { concepts, total, loading, mutate } = useSalaryConceptsData();
  const [selected, setSelected] = useState<SalaryConcept | null>(null);
  const [actionItem, setActionItem] = useState<SalaryConcept | null>(null);
  const [formDialog, setFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

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
      await deleteSalaryConcept(selected.id);
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Concepto eliminado",
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
      detail: selected?.id ? "Concepto actualizado" : "Concepto creado",
      life: 3000,
    });
    await mutate();
    setFormDialog(false);
    setSelected(null);
  };

  const handleSeedCCP = async () => {
    try {
      setSeeding(true);
      await seedCCPConcepts();
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Conceptos CCP cargados exitosamente",
        life: 3000,
      });
      await mutate();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Menu ref={menuRef} model={menuItems} popup />
      <DataTable
        value={concepts}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        dataKey="id"
        scrollable
        sortMode="multiple"
        header={
          <div className="flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h4 className="m-0">Conceptos Salariales</h4>
              <span className="text-600 text-sm">({total} total)</span>
            </div>
            <div className="flex gap-2">
              <Button
                label="Cargar Conceptos CCP"
                icon={seeding ? "pi pi-spin pi-spinner" : "pi pi-download"}
                className="p-button-outlined p-button-secondary"
                loading={seeding}
                onClick={handleSeedCCP}
                tooltip="Cargar conceptos del Contrato Colectivo Petrolero"
                tooltipOptions={{ position: 'top' }}
              />
              <CreateButton
                label="Nuevo Concepto"
                onClick={() => {
                  setSelected(null);
                  setFormDialog(true);
                }}
              />
            </div>
          </div>
        }
        emptyMessage="Sin conceptos salariales"
      >
        <Column field="code" header="Código" sortable />
        <Column field="name" header="Nombre" sortable />
        <Column
          field="type"
          header="Tipo"
          body={(row) => (
            <Tag value={row.type} severity={TYPE_SEVERITY[row.type]} />
          )}
        />
        <Column
          field="isTaxable"
          header="Gravable"
          body={(row) => (
            <i
              className={`pi ${
                row.isTaxable
                  ? "pi-check text-green-500"
                  : "pi-times text-gray-400"
              }`}
            />
          )}
        />
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
          field="formula"
          header="Fórmula"
          body={(row) =>
            row.formula ? (
              <code
                className="text-xs surface-100 border-round px-2 py-1"
                title={row.formula}
                style={{ fontFamily: "monospace", maxWidth: 200, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {row.formula}
              </code>
            ) : (
              <span className="text-400 text-sm">Manual</span>
            )
          }
        />
        <Column
          field="executionOrder"
          header="Orden"
          sortable
          style={{ width: "80px" }}
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
        header={selected?.id ? "Editar Concepto" : "Nuevo Concepto"}
        visible={formDialog}
        onHide={() => {
          setFormDialog(false);
          setSelected(null);
        }}
        style={{ width: "500px" }}
        modal
      >
        <SalaryConceptForm
          concept={selected}
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
        itemName={`¿Eliminar concepto "${selected?.name}"?`}
      />
    </>
  );
}
