"use client";

import { useRef, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { Menu } from "primereact/menu";
import { classNames } from "primereact/utils";
import { useDepartmentsData } from "@/modules/nomina/departments/hooks/useDepartmentsData";
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/modules/nomina/departments/services/department.service";
import {
  createDepartmentSchema,
  CreateDepartmentFormData,
} from "@/modules/nomina/departments/schemas/department.schema";
import { Department } from "@/modules/nomina/departments/interfaces/department.interface";
import { handleFormError } from "@/utils/errorHandlers";

interface DepartmentFormProps {
  department?: Department | null;
  onSave: () => void;
  onCancel: () => void;
  formId?: string;
}

const DepartmentForm = ({
  department,
  onSave,
  onCancel,
  formId = "department-form",
}: DepartmentFormProps) => {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateDepartmentFormData>({
    resolver: zodResolver(createDepartmentSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        code: department.code || "",
        description: department.description || "",
        isActive: department.isActive,
      });
    } else {
      reset({
        name: "",
        code: "",
        description: "",
        isActive: true,
      });
    }
  }, [department, reset]);

  const onSubmit = async (data: CreateDepartmentFormData) => {
    try {
      setIsSubmitting(true);
      if (department?.id) {
        await updateDepartment(department.id, data);
        toast.current?.show({
          severity: "success",
          summary: "Éxito",
          detail: "Departamento actualizado",
          life: 3000,
        });
      } else {
        await createDepartment(data);
        toast.current?.show({
          severity: "success",
          summary: "Éxito",
          detail: "Departamento creado",
          life: 3000,
        });
      }
      onSave();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <form onSubmit={handleSubmit(onSubmit)} id={formId}>
        <div className="field">
          <label htmlFor="name">
            Nombre <span className="text-red-500">*</span>
          </label>
          <InputText
            id="name"
            {...register("name")}
            className={classNames({ "p-invalid": errors.name })}
            placeholder="Ej: Ventas"
          />
          {errors.name && (
            <small className="p-error">{errors.name.message}</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="code">Código</label>
          <InputText
            id="code"
            {...register("code")}
            className={classNames({ "p-invalid": errors.code })}
            placeholder="Ej: VTA"
            maxLength={20}
          />
          {errors.code && (
            <small className="p-error">{errors.code.message}</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="description">Descripción</label>
          <InputText
            id="description"
            {...register("description")}
            className={classNames({ "p-invalid": errors.description })}
            placeholder="Descripción opcional"
            maxLength={500}
          />
          {errors.description && (
            <small className="p-error">{errors.description.message}</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="isActive">Activo</label>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <InputSwitch
                id="isActive"
                checked={field.value}
                onChange={(e) => field.onChange(e.value)}
              />
            )}
          />
        </div>
      </form>
    </>
  );
};

export default function DepartmentsList() {
  const toast = useRef<Toast>(null);
  const { departments, loading, mutate } = useDepartmentsData();

  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [departmentFormDialog, setDepartmentFormDialog] = useState(false);
  const [deleteDepartmentDialog, setDeleteDepartmentDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const editDepartment = (dept: Department) => {
    setSelectedDepartment(dept);
    setDepartmentFormDialog(true);
  };

  const confirmDeleteDepartment = (dept: Department) => {
    setSelectedDepartment(dept);
    setDeleteDepartmentDialog(true);
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
      setDeleteDepartmentDialog(false);
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

  const actionBodyTemplate = (rowData: Department) => {
    return (
      <Button
        icon="pi pi-ellipsis-v"
        rounded
        text
        onClick={(e) => {
          const menuItems = [
            {
              label: "Editar",
              icon: "pi pi-pencil",
              command: () => editDepartment(rowData),
            },
            {
              label: "Eliminar",
              icon: "pi pi-trash",
              className: "p-error",
              command: () => confirmDeleteDepartment(rowData),
            },
          ];
          setSelectedDepartment(rowData);
          e.currentTarget.parentElement?.querySelector("button")?.click();
        }}
      />
    );
  };

  return (
    <>
      <Toast ref={toast} />

      <div className="flex align-items-center justify-content-between mb-4">
        <h3>Departamentos</h3>
        <Button
          label="Nuevo Departamento"
          icon="pi pi-plus"
          onClick={() => {
            setSelectedDepartment(null);
            setDepartmentFormDialog(true);
          }}
        />
      </div>

      <DataTable
        value={departments}
        loading={loading}
        paginator
        rows={10}
        scrollable
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
          frozen
          alignFrozen="right"
        />
      </DataTable>

      <Dialog
        visible={departmentFormDialog}
        style={{ width: "500px" }}
        header={
          selectedDepartment ? "Editar Departamento" : "Nuevo Departamento"
        }
        modal
        onHide={hideFormDialog}
        footer={
          <div className="flex gap-2 justify-content-end">
            <Button label="Cancelar" onClick={hideFormDialog} />
            <Button label="Guardar" form="department-form" />
          </div>
        }
      >
        <DepartmentForm
          department={selectedDepartment}
          onSave={() => {
            hideFormDialog();
            mutate();
          }}
          onCancel={hideFormDialog}
          formId="department-form"
        />
      </Dialog>

      <Dialog
        visible={deleteDepartmentDialog}
        style={{ width: "450px" }}
        header="Confirmar"
        modal
        footer={
          <div className="flex gap-2 justify-content-end">
            <Button
              label="No"
              onClick={() => setDeleteDepartmentDialog(false)}
            />
            <Button
              label="Sí, eliminar"
              severity="danger"
              loading={isDeleting}
              onClick={deleteDept}
            />
          </div>
        }
        onHide={() => setDeleteDepartmentDialog(false)}
      >
        <div className="flex gap-3 align-items-center">
          <i className="pi pi-exclamation-triangle text-red-500 text-2xl" />
          <span>
            ¿Estás seguro de que deseas eliminar{" "}
            <b>{selectedDepartment?.name}</b>?
          </span>
        </div>
      </Dialog>
    </>
  );
}
