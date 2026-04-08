"use client";

import { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import { classNames } from "primereact/utils";
import CreateButton from "@/shared/components/CreateButton";
import DeleteConfirmDialog from "@/shared/components/DeleteConfirmDialog";
import FormActionButtons from "@/shared/components/FormActionButtons";
import DepartmentForm from "./DepartmentForm";
import { useDepartmentsData } from "@/modules/nomina/departments/hooks/useDepartmentsData";
import { deleteDepartment } from "@/modules/nomina/departments/services/department.service";
import { Department } from "@/modules/nomina/departments/interfaces/department.interface";
import { handleFormError } from "@/utils/errorHandlers";

export default function DepartmentsList() {
  // ──────────────────────────────────────────────────────────────────
  // REFS & HOOKS
  // ──────────────────────────────────────────────────────────────────
  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { departments, total, loading, mutate } = useDepartmentsData(
    searchQuery || undefined,
  );

  // ──────────────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────────────
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [actionItem, setActionItem] = useState<Department | null>(null);
  const [departmentFormDialog, setDepartmentFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ──────────────────────────────────────────────────────────────────
  // SEARCH HANDLER
  // ──────────────────────────────────────────────────────────────────
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  // MENU ITEMS
  // ──────────────────────────────────────────────────────────────────
  const getMenuItems = (dept: Department | null): MenuItem[] => {
    if (!dept) return [];
    return [
      {
        label: "Editar",
        icon: "pi pi-pencil",
        command: () => editDepartment(dept),
      },
      {
        separator: true,
      },
      {
        label: "Eliminar",
        icon: "pi pi-trash",
        className: "p-menuitem-danger",
        command: () => confirmDeleteDepartment(dept),
      },
    ];
  };

  // ──────────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────────
  const editDepartment = (dept: Department) => {
    setSelectedDepartment(dept);
    setDepartmentFormDialog(true);
  };

  const confirmDeleteDepartment = (dept: Department) => {
    setSelectedDepartment(dept);
    setDeleteDialog(true);
  };

  const deleteDept = async () => {
    if (!selectedDepartment?.id) return;
    try {
      setIsDeleting(true);
      await deleteDepartment(selectedDepartment.id);
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Departamento eliminado",
        life: 3000,
      });
      setDeleteDialog(false);
      setSelectedDepartment(null);
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setIsDeleting(false);
    }
  };

  const hideFormDialog = () => {
    setSelectedDepartment(null);
    setDepartmentFormDialog(false);
  };

  const handleSave = async () => {
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: selectedDepartment?.id
        ? "Departamento actualizado correctamente"
        : "Departamento creado correctamente",
      life: 3000,
    });
    await mutate();
    hideFormDialog();
  };

  const openNew = () => {
    setSelectedDepartment(null);
    setDepartmentFormDialog(true);
  };

  // ──────────────────────────────────────────────────────────────────
  // ACTION TEMPLATE
  // ──────────────────────────────────────────────────────────────────
  const actionBodyTemplate = (rowData: Department) => {
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
        value={departments}
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
              <h4 className="m-0">Departamentos</h4>
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
              <CreateButton label="Nuevo Departamento" onClick={openNew} />
            </div>
          </div>
        }
        emptyMessage="Sin departamentos"
      >
        <Column field="name" header="Nombre" sortable />
        <Column field="code" header="Código" sortable />
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
        id="department-menu"
        model={getMenuItems(actionItem)}
        popup
      />

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* DIALOG: CREATE/EDIT FORM */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <Dialog
        visible={departmentFormDialog}
        modal
        maximizable
        style={{ width: "75vw" }}
        breakpoints={{ "1400px": "75vw", "900px": "85vw", "600px": "95vw" }}
        onHide={hideFormDialog}
        header={
          <div className="mb-2 text-center md:text-left">
            <div className="border-bottom-2 border-primary pb-2">
              <h2 className="text-2xl font-bold text-900 mb-2 flex align-items-center justify-content-center md:justify-content-start">
                <i className="pi pi-sitemap mr-3 text-primary text-3xl"></i>
                {selectedDepartment
                  ? "Editar Departamento"
                  : "Nuevo Departamento"}
              </h2>
            </div>
          </div>
        }
        footer={
          <FormActionButtons
            formId="department-form"
            isUpdate={!!selectedDepartment?.id}
            onCancel={hideFormDialog}
            isSubmitting={isSubmitting}
          />
        }
      >
        <DepartmentForm
          department={selectedDepartment}
          onSave={handleSave}
          formId="department-form"
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
          setSelectedDepartment(null);
        }}
        onConfirm={deleteDept}
        itemName={selectedDepartment?.name}
        isDeleting={isDeleting}
      />
    </>
  );
}
