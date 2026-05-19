"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import FormActionButtons from "@/shared/components/FormActionButtons";
import {
  EmployeeDeduction,
  CreateEmployeeDeductionRequest,
  CalcType,
} from "../interfaces/employeeDeduction.interface";
import {
  createEmployeeDeduction,
  updateEmployeeDeduction,
} from "../services/employeeDeduction.service";

const CALC_TYPES: { label: string; value: CalcType }[] = [
  { label: "Monto Fijo", value: "Monto Fijo" },
  { label: "Porcentaje", value: "Porcentaje" },
];

interface Props {
  deduction?: EmployeeDeduction | null;
  onSave: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
}

export default function EmployeeDeductionForm({
  deduction,
  onSave,
  onCancel,
  isSubmitting,
  setIsSubmitting,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      employeeId: "",
      conceptId: "",
      calcType: "Monto Fijo",
      amount: null,
      percentage: null,
      description: "",
      startDate: null,
      endDate: null,
    },
  });
  const calcType = watch("calcType");

  useEffect(() => {
    reset(
      deduction
        ? {
            employeeId: deduction.employeeId,
            conceptId: deduction.conceptId,
            calcType: deduction.calcType,
            amount: deduction.amount,
            percentage: deduction.percentage,
            description: deduction.description ?? "",
            startDate: deduction.startDate
              ? new Date(deduction.startDate)
              : null,
            endDate: deduction.endDate ? new Date(deduction.endDate) : null,
          }
        : {
            employeeId: "",
            conceptId: "",
            calcType: "Monto Fijo",
            amount: null,
            percentage: null,
            description: "",
            startDate: null,
            endDate: null,
          },
    );
  }, [deduction, reset]);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        startDate: data.startDate
          ? (data.startDate as Date).toISOString().split("T")[0]
          : undefined,
        endDate: data.endDate
          ? (data.endDate as Date).toISOString().split("T")[0]
          : undefined,
      };
      if (deduction?.id) await updateEmployeeDeduction(deduction.id, payload);
      else await createEmployeeDeduction(payload);
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
              disabled={!!deduction?.id}
            />
          )}
        />
      </div>
      <div className="field">
        <label>ID Concepto *</label>
        <Controller
          name="conceptId"
          control={control}
          render={({ field }) => <InputText {...field} className="w-full" />}
        />
      </div>
      <div className="field">
        <label>Tipo de Cálculo *</label>
        <Controller
          name="calcType"
          control={control}
          render={({ field }) => (
            <Dropdown {...field} options={CALC_TYPES} className="w-full" />
          )}
        />
      </div>
      {calcType === "Monto Fijo" && (
        <div className="field">
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
      )}
      {calcType === "Porcentaje" && (
        <div className="field">
          <label>Porcentaje *</label>
          <Controller
            name="percentage"
            control={control}
            render={({ field }) => (
              <InputNumber
                value={field.value}
                onValueChange={(e) => field.onChange(e.value)}
                mode="decimal"
                suffix="%"
                minFractionDigits={2}
                className="w-full"
              />
            )}
          />
        </div>
      )}
      <div className="field">
        <label>Fecha de Inicio *</label>
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <Calendar
              {...field}
              dateFormat="yy-mm-dd"
              className="w-full"
              showIcon
            />
          )}
        />
      </div>
      <div className="field">
        <label>Fecha de Fin</label>
        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <Calendar
              {...field}
              dateFormat="yy-mm-dd"
              className="w-full"
              showIcon
            />
          )}
        />
      </div>
      <div className="field">
        <label>Descripción</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <InputTextarea {...field} className="w-full" rows={2} />
          )}
        />
      </div>
      <FormActionButtons
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitLabel={deduction?.id ? "Actualizar" : "Crear"}
      />
    </form>
  );
}
