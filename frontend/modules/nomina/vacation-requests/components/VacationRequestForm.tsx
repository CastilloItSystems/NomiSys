"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import FormActionButtons from "@/shared/components/FormActionButtons";
import { createVacationRequest } from "../services/vacationRequest.service";

interface Props {
  onSave: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
}

export default function VacationRequestForm({
  onSave,
  onCancel,
  isSubmitting,
  setIsSubmitting,
}: Props) {
  const { control, handleSubmit, reset } = useForm<any>({
    defaultValues: {
      employeeId: "",
      startDate: null,
      endDate: null,
      days: null,
      reason: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createVacationRequest({
        ...data,
        startDate: (data.startDate as Date).toISOString().split("T")[0],
        endDate: (data.endDate as Date).toISOString().split("T")[0],
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
          render={({ field }) => <InputText {...field} className="w-full" />}
        />
      </div>
      <div className="grid">
        <div className="col-6 field">
          <label>Fecha Inicio *</label>
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
        <div className="col-6 field">
          <label>Fecha Fin *</label>
          <Controller
            name="endDate"
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
      </div>
      <div className="field">
        <label>Días *</label>
        <Controller
          name="days"
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
        submitLabel="Solicitar Vacaciones"
      />
    </form>
  );
}
