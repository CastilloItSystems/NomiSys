"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import FormActionButtons from "@/shared/components/FormActionButtons";
import { Loan } from "../interfaces/loan.interface";
import { createLoan } from "../services/loan.service";

interface Props {
  loan?: Loan | null;
  onSave: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
}

export default function LoanForm({
  loan,
  onSave,
  onCancel,
  isSubmitting,
  setIsSubmitting,
}: Props) {
  const { control, handleSubmit, reset } = useForm<any>({
    defaultValues: {
      employeeId: "",
      amount: null,
      installments: null,
      startDate: null,
      reason: "",
    },
  });

  useEffect(() => {
    reset(
      loan
        ? {
            employeeId: loan.employeeId,
            amount: loan.amount,
            installments: loan.installments,
            startDate: new Date(loan.startDate),
            reason: loan.reason ?? "",
          }
        : {
            employeeId: "",
            amount: null,
            installments: null,
            startDate: null,
            reason: "",
          },
    );
  }, [loan, reset]);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createLoan({
        ...data,
        startDate: (data.startDate as Date).toISOString().split("T")[0],
      });
      onSave();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column gap-3">
      <div className="field">
        <label>ID Empleado *</label>
        <Controller
          name="employeeId"
          control={control}
          render={({ field }) => (
            <InputText {...field} className="w-full" disabled={!!loan?.id} />
          )}
        />
      </div>
      <div className="grid">
        <div className="col-6 field">
          <label>Monto *</label>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <InputNumber
                value={field.value}
                onValueChange={(e) => field.onChange(e.value)}
                mode="decimal"
                minFractionDigits={2}
                className="w-full"
              />
            )}
          />
        </div>
        <div className="col-6 field">
          <label>Cuotas *</label>
          <Controller
            name="installments"
            control={control}
            render={({ field }) => (
              <InputNumber
                value={field.value}
                onValueChange={(e) => field.onChange(e.value)}
                className="w-full"
              />
            )}
          />
        </div>
      </div>
      <div className="field">
        <label>Fecha de Inicio *</label>
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <Calendar
              {...field}
              dateFormat="yy-mm-dd"
              showIcon
              className="w-full"
            />
          )}
        />
      </div>
      <div className="field">
        <label>Motivo</label>
        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <InputTextarea {...field} className="w-full" rows={2} />
          )}
        />
      </div>
      <FormActionButtons
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitLabel="Registrar Préstamo"
      />
    </form>
  );
}
