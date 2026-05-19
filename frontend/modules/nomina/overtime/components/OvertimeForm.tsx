"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import FormActionButtons from "@/shared/components/FormActionButtons";
import { Overtime, OvertimeType } from "../interfaces/overtime.interface";
import { createOvertime, updateOvertime } from "../services/overtime.service";

const TYPE_OPTIONS: { label: string; value: OvertimeType }[] = [
  { label: "Diurna", value: "Diurna" },
  { label: "Nocturna", value: "Nocturna" },
  { label: "Feriada Diurna", value: "Feriada Diurna" },
  { label: "Feriada Nocturna", value: "Feriada Nocturna" },
];

interface Props {
  overtime?: Overtime | null;
  onSave: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
}

export default function OvertimeForm({
  overtime,
  onSave,
  onCancel,
  isSubmitting,
  setIsSubmitting,
}: Props) {
  const { control, handleSubmit, reset } = useForm<any>({
    defaultValues: {
      employeeId: "",
      date: null,
      hours: null,
      type: "Diurna",
      notes: "",
    },
  });

  useEffect(() => {
    reset(
      overtime
        ? {
            employeeId: overtime.employeeId,
            date: new Date(overtime.date),
            hours: overtime.hours,
            type: overtime.type,
            notes: overtime.notes ?? "",
          }
        : {
            employeeId: "",
            date: null,
            hours: null,
            type: "Diurna",
            notes: "",
          },
    );
  }, [overtime, reset]);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        date: (data.date as Date).toISOString().split("T")[0],
      };
      if (overtime?.id) await updateOvertime(overtime.id, payload);
      else await createOvertime(payload);
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
            <InputText
              {...field}
              className="w-full"
              disabled={!!overtime?.id}
            />
          )}
        />
      </div>
      <div className="grid">
        <div className="col-6 field">
          <label>Fecha *</label>
          <Controller
            name="date"
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
          <label>Horas *</label>
          <Controller
            name="hours"
            control={control}
            render={({ field }) => (
              <InputNumber
                value={field.value}
                onValueChange={(e) => field.onChange(e.value)}
                mode="decimal"
                minFractionDigits={1}
                className="w-full"
              />
            )}
          />
        </div>
      </div>
      <div className="field">
        <label>Tipo *</label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Dropdown {...field} options={TYPE_OPTIONS} className="w-full" />
          )}
        />
      </div>
      <div className="field">
        <label>Notas</label>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <InputTextarea {...field} className="w-full" rows={2} />
          )}
        />
      </div>
      <FormActionButtons
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitLabel={overtime?.id ? "Actualizar" : "Registrar"}
      />
    </form>
  );
}
