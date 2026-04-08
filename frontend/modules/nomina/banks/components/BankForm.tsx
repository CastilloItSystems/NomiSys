"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { classNames } from "primereact/utils";
import {
  createBank,
  updateBank,
} from "@/modules/nomina/banks/services/bank.service";
import {
  createBankSchema,
  CreateBankFormData,
} from "@/modules/nomina/banks/schemas/bank.schema";
import { Bank } from "@/modules/nomina/banks/interfaces/bank.interface";
import { handleFormError } from "@/utils/errorHandlers";

interface BankFormProps {
  bank?: Bank | null;
  onSave: () => void | Promise<void>;
  formId?: string;
  onSubmittingChange?: (isSubmitting: boolean) => void;
  toast: React.RefObject<Toast>;
}

const BankForm = ({
  bank,
  onSave,
  formId = "bank-form",
  onSubmittingChange,
  toast,
}: BankFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateBankFormData>({
    resolver: zodResolver(createBankSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (bank) {
      reset({
        name: bank.name,
        code: bank.code,
        isActive: bank.isActive,
      });
    } else {
      reset({
        name: "",
        code: "",
        isActive: true,
      });
    }
  }, [bank, reset]);

  const onSubmit = async (data: CreateBankFormData) => {
    if (onSubmittingChange) onSubmittingChange(true);
    try {
      if (bank?.id) {
        await updateBank(bank.id, { ...data, id: bank.id } as any);
      } else {
        await createBank(data);
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
          placeholder="Ej: Banesco"
        />
        {errors.name && (
          <small className="p-error">{errors.name.message}</small>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* CÓDIGO SUDEBAN */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <div className="field">
        <label htmlFor="code">
          Código SUDEBAN <span className="text-red-500">*</span>
        </label>
        <InputText
          id="code"
          {...register("code")}
          className={classNames({ "p-invalid": errors.code })}
          placeholder="Ej: 0134"
          maxLength={10}
        />
        {errors.code && (
          <small className="p-error">{errors.code.message}</small>
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

export default BankForm;
