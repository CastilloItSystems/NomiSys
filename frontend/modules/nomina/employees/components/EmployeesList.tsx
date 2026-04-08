"use client";

import { useRef, useState, useMemo } from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";
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
import EmployeeForm from "./EmployeeForm";
import EmployeeExpedient from "./EmployeeExpedient";
import { useEmployeesData } from "@/modules/nomina/employees/hooks/useEmployeesData";
import { deleteEmployee } from "@/modules/nomina/employees/services/employee.service";
import { Employee } from "@/modules/nomina/employees/interfaces/employee.interface";
import { handleFormError } from "@/utils/errorHandlers";

export default function EmployeesList() {
  // ──────────────────────────────────────────────────────────────────
  // REFS & HOOKS
  // ──────────────────────────────────────────────────────────────────
  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(10);
  const { employees, total, loading, mutate } = useEmployeesData(
    page,
    rows,
    debouncedSearch || undefined,
  );
  // ──────────────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────────────
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [actionItem, setActionItem] = useState<Employee | null>(null);
  const [employeeFormDialog, setEmployeeFormDialog] = useState(false);
  const [expedientDialog, setExpedientDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ──────────────────────────────────────────────────────────────────
  // SEARCH HANDLER
  // ──────────────────────────────────────────────────────────────────
  const handleSearch = (query: string) => {
    setPage(0); // Reset to first page on new search
    setSearchQuery(query);
  };

  // ──────────────────────────────────────────────────────────────────
  // MENU ITEMS
  // ──────────────────────────────────────────────────────────────────
  const getMenuItems = (emp: Employee | null): MenuItem[] => {
    if (!emp) return [];
    return [
      {
        label: "Ver Detalles",
        icon: "pi pi-eye",
        command: () => viewEmployeeExpedient(emp),
      },
      {
        label: "Editar",
        icon: "pi pi-pencil",
        command: () => editEmployee(emp),
      },
      {
        separator: true,
      },
      {
        label: "Eliminar",
        icon: "pi pi-trash",
        className: "p-menuitem-danger",
        command: () => confirmDeleteEmployee(emp),
      },
    ];
  };

  // ──────────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────────
  const viewEmployeeExpedient = (emp: Employee) => {
    setSelectedEmployee(emp);
    setExpedientDialog(true);
  };

  const editEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEmployeeFormDialog(true);
  };

  const confirmDeleteEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setDeleteDialog(true);
  };

  const deleteEmp = async () => {
    if (!selectedEmployee?.id) return;
    try {
      setIsDeleting(true);
      await deleteEmployee(selectedEmployee.id);
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Empleado eliminado",
        life: 3000,
      });
      setDeleteDialog(false);
      setSelectedEmployee(null);
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setIsDeleting(false);
    }
  };

  const hideFormDialog = () => {
    setSelectedEmployee(null);
    setEmployeeFormDialog(false);
  };

  const handleSave = async () => {
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: selectedEmployee?.id
        ? "Empleado actualizado correctamente"
        : "Empleado creado correctamente",
      life: 3000,
    });
    await mutate();
    hideFormDialog();
  };

  const openNew = () => {
    setSelectedEmployee(null);
    setEmployeeFormDialog(true);
  };

  const menuItems = useMemo(() => getMenuItems(actionItem), [actionItem]);

  // ──────────────────────────────────────────────────────────────────
  // ACTION TEMPLATE
  // ──────────────────────────────────────────────────────────────────
  const actionBodyTemplate = (rowData: Employee) => {
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

  const statusBodyTemplate = (rowData: Employee) => {
    let severity:
      | "success"
      | "secondary"
      | "info"
      | "warning"
      | "danger"
      | undefined;
    let icon: string;

    switch (rowData.status) {
      case "ACTIVE":
        severity = "success";
        icon = "pi-check";
        break;
      case "INACTIVE":
        severity = "secondary";
        icon = "pi-times";
        break;
      case "SUSPENDED":
        severity = "warning";
        icon = "pi-exclamation-triangle";
        break;
      case "TERMINATED":
        severity = "danger";
        icon = "pi-sign-out";
        break;
      case "ONBOARDING":
        severity = "info";
        icon = "pi-calendar";
        break;
      default:
        severity = "secondary";
        icon = "pi-question";
    }

    return (
      <i
        className={classNames("pi", `pi-${icon}`)}
        style={{
          color:
            severity === "success"
              ? "#22C55E"
              : severity === "secondary"
              ? "#999"
              : severity === "warning"
              ? "#F59E0B"
              : severity === "danger"
              ? "#EF4444"
              : severity === "info"
              ? "#3B82F6"
              : "#999",
          fontSize: "1.1rem",
        }}
        title={rowData.status}
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
        value={employees}
        loading={loading}
        paginator
        rows={rows}
        totalRecords={total}
        onPage={(e) => {
          setPage(e.page ?? 0);
          setRows(e.rows ?? 10);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        dataKey="id"
        scrollable
        sortMode="multiple"
        header={
          <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <div className="flex align-items-center gap-2">
              <h4 className="m-0">Empleados</h4>
              <span className="text-600 text-sm">({total} total)</span>
            </div>
            <div className="flex gap-2">
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  type="search"
                  placeholder="Buscar por código, nombre o cédula..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </span>
              <CreateButton label="Nuevo Empleado" onClick={openNew} />
            </div>
          </div>
        }
        lazy
        emptyMessage="Sin empleados"
      >
        <Column field="employeeCode" header="Código" sortable />
        <Column
          header="Nombre"
          body={(rowData) => `${rowData.firstName} ${rowData.lastName}`}
          sortable
        />
        <Column
          header="Documento"
          body={(rowData) =>
            `${rowData.documentType}-${rowData.documentNumber}`
          }
          sortable
        />
        <Column field="phone" header="Teléfono" sortable />
        <Column
          field="status"
          header="Estatus"
          body={statusBodyTemplate}
          sortable
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
      <Menu ref={menuRef} id="employee-menu" model={menuItems} popup />

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* DIALOG: CREATE/EDIT FORM */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <Dialog
        visible={employeeFormDialog}
        modal
        maximizable
        style={{ width: "90vw", height: "90vh" }}
        breakpoints={{ "1400px": "90vw", "900px": "95vw", "600px": "98vw" }}
        onHide={hideFormDialog}
        header={
          <div className="mb-2 text-center md:text-left">
            <div className="border-bottom-2 border-primary pb-2">
              <h2 className="text-2xl font-bold text-900 mb-2 flex align-items-center justify-content-center md:justify-content-start">
                <i className="pi pi-users mr-3 text-primary text-3xl"></i>
                {selectedEmployee ? "Editar Empleado" : "Nuevo Empleado"}
              </h2>
            </div>
          </div>
        }
        footer={
          <FormActionButtons
            formId="employee-form"
            isUpdate={!!selectedEmployee?.id}
            onCancel={hideFormDialog}
            isSubmitting={isSubmitting}
          />
        }
      >
        <EmployeeForm
          employee={selectedEmployee}
          onSave={handleSave}
          formId="employee-form"
          onSubmittingChange={setIsSubmitting}
          toast={toast}
        />
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* DIALOG: EMPLOYEE EXPEDIENT (READ-ONLY DETAILS) */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      {expedientDialog && selectedEmployee?.id && (
        <EmployeeExpedient
          employeeId={selectedEmployee.id}
          onClose={() => {
            setExpedientDialog(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* DIALOG: DELETE CONFIRMATION */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <DeleteConfirmDialog
        visible={deleteDialog}
        onHide={() => {
          setDeleteDialog(false);
          setSelectedEmployee(null);
        }}
        onConfirm={deleteEmp}
        itemName={`${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`}
        isDeleting={isDeleting}
      />
    </>
  );
}
