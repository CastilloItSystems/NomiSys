"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { classNames } from "primereact/utils";
import {
  createPosition,
  updatePosition,
} from "@/modules/nomina/positions/services/position.service";
import {
  createPositionSchema,
  CreatePositionFormData,
} from "@/modules/nomina/positions/schemas/position.schema";
import { Position } from "@/modules/nomina/positions/interfaces/position.interface";
import { handleFormError } from "@/utils/errorHandlers";

interface PositionFormProps {
  position?: Position | null;
  onSave: () => void | Promise<void>;
  formId?: string;
  onSubmittingChange?: (isSubmitting: boolean) => void;
  toast: React.RefObject<Toast>;
}

const PositionForm = ({
  position,
  onSave,
  formId = "position-form",
  onSubmittingChange,
  toast,
}: PositionFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePositionFormData>({
    resolver: zodResolver(createPositionSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (position) {
      reset({
        name: position.name,
        code: position.code || "",
        description: position.description || "",
        level: position.level || undefined,
        isActive: position.isActive,
      });
    } else {
      reset({
        name: "",
        code: "",
        description: "",
        level: undefined,
        isActive: true,
      });
    }
  }, [position, reset]);

  const onSubmit = async (data: CreatePositionFormData) => {
    if (onSubmittingChange) onSubmittingChange(true);
    try {
      if (position?.id) {
        await updatePosition(position.id, { ...data, id: position.id } as any);
      } else {
        await createPosition(data);
      }
      await onSave();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      if (onSubmittingChange) onSubmittingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id={formId}>
      {/* ──────────────────────────────────────────────────────────────── */}
      {/* NOMBRE */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <div className="field">
        <label htmlFor="name">
          Nombre <span className="text-red-500">*</span>
        </label>
        <InputText
          id="name"
          {...register("name")}
          className={classNames({ "p-invalid": errors.name })}
          placeholder="Ej: Gerente de Ventas"
        />
        {errors.name && (
          <small className="p-error">{errors.name.message}</small>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* CÓDIGO */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <div className="field">
        <label htmlFor="code">Código</label>
        <InputText
          id="code"
          {...register("code")}
          className={classNames({ "p-invalid": errors.code })}
          placeholder="Ej: GER-VENTAS"
          maxLength={20}
        />
        {errors.code && (
          <small className="p-error">{errors.code.message}</small>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* DESCRIPCIÓN */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <div className="field">
        <label htmlFor="description">Descripción</label>
        <InputText
          id="description"
          {...register("description")}
          className={classNames({ "p-invalid": errors.description })}
          placeholder="Descripción del cargo"
          maxLength={500}
        />
        {errors.description && (
          <small className="p-error">{errors.description.message}</small>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* NIVEL JERÁRQUICO */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <div className="field">
        <label htmlFor="level">Nivel Jerárquico</label>
        <Controller
          name="level"
          control={control}
          render={({ field }) => (
            <InputNumber
              id="level"
              value={field.value}
              onValueChange={(e) => field.onChange(e.value)}
              placeholder="Nivel"
              min={1}
            />
          )}
        />
        {errors.level && (
          <small className="p-error">{errors.level.message}</small>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* ACTIVO */}
      {/* ──────────────────────────────────────────────────────────────── */}
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
  );
};

export default PositionForm;
