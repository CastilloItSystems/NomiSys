"use client";

import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { classNames } from "primereact/utils";
import {
  createDepartment,
  updateDepartment,
} from "@/modules/nomina/departments/services/department.service";
import {
  createDepartmentSchema,
  CreateDepartmentFormData,
} from "@/modules/nomina/departments/schemas/department.schema";
import { Department } from "@/modules/nomina/departments/interfaces/department.interface";
import { handleFormError } from "@/utils/errorHandlers";

interface DepartmentFormProps {
  department?: Department | null;
  onSave: () => void | Promise<void>;
  formId?: string;
  onSubmittingChange?: (isSubmitting: boolean) => void;
  toast: React.RefObject<Toast>;
}

const DepartmentForm = ({
  department,
  onSave,
  formId = "department-form",
  onSubmittingChange,
  toast,
}: DepartmentFormProps) => {
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
    if (onSubmittingChange) onSubmittingChange(true);
    try {
      if (department?.id) {
        await updateDepartment(department.id, {
          ...data,
          id: department.id,
        } as any);
      } else {
        await createDepartment(data);
      }
      await onSave();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      if (onSubmittingChange) onSubmittingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id={formId} className="p-fluid">
      <div className="grid formgrid">
        {/* ──────────────────────────────────────────────────────────────── */}
        {/* NOMBRE */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <div className="field col-12 md:col-6">
          <label htmlFor="name" className="font-medium text-900 block mb-2">
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

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* CÓDIGO */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <div className="field col-12 md:col-6">
          <label htmlFor="code" className="font-medium text-900 block mb-2">
            Código
          </label>
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

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* DESCRIPCIÓN */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <div className="field col-12">
          <label
            htmlFor="description"
            className="font-medium text-900 block mb-2"
          >
            Descripción
          </label>
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

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* ACTIVO */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <div className="field col-12 md:col-6 flex flex-column">
          <label htmlFor="isActive" className="font-medium text-900 block mb-2">
            Activo
          </label>
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
      </div>
    </form>
  );
};

export default DepartmentForm;
