"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { classNames } from "primereact/utils";
import {
  createPayrollPeriod,
  updatePayrollPeriod,
} from "@/modules/nomina/payroll-periods/services/payrollPeriod.service";
import {
  createPayrollPeriodSchema,
  CreatePayrollPeriodFormData,
} from "@/modules/nomina/payroll-periods/schemas/payrollPeriod.schema";
import { PayrollPeriod } from "@/modules/nomina/payroll-periods/interfaces/payrollPeriod.interface";
import { handleFormError } from "@/utils/errorHandlers";

const FREQUENCY_OPTIONS = [
  { label: "Semanal", value: "Semanal" },
  { label: "Quincenal", value: "Quincenal" },
  { label: "Mensual", value: "Mensual" },
];

const toDateString = (d?: string | Date | null): string => {
  if (!d) return "";
  const date = new Date(d);
  return date.toISOString().split("T")[0];
};

interface PayrollPeriodFormProps {
  period?: PayrollPeriod | null;
  onSave: () => void | Promise<void>;
  formId?: string;
  onSubmittingChange?: (isSubmitting: boolean) => void;
  toast: React.RefObject<Toast>;
}

const PayrollPeriodForm = ({
  period,
  onSave,
  formId = "payroll-period-form",
  onSubmittingChange,
  toast,
}: PayrollPeriodFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePayrollPeriodFormData>({
    resolver: zodResolver(createPayrollPeriodSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (period) {
      reset({
        name: period.name,
        frequency: period.frequency,
        startDate: toDateString(period.startDate),
        endDate: toDateString(period.endDate),
        paymentDate: toDateString(period.paymentDate),
      });
    } else {
      reset({
        name: "",
        frequency: undefined,
        startDate: "",
        endDate: "",
        paymentDate: "",
      });
    }
  }, [period, reset]);

  const onSubmit = async (data: CreatePayrollPeriodFormData) => {
    if (onSubmittingChange) onSubmittingChange(true);
    try {
      if (period?.id) {
        await updatePayrollPeriod(period.id, { ...data, id: period.id } as any);
      } else {
        await createPayrollPeriod(data);
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
        <div className="field col-12">
          <label htmlFor="name" className="font-medium text-900 block mb-2">
            Nombre del Período <span className="text-red-500">*</span>
          </label>
          <InputText
            id="name"
            {...register("name")}
            className={classNames({ "p-invalid": errors.name })}
            placeholder="Ej: Quincena 1 - Enero 2026"
          />
          {errors.name && (
            <small className="p-error">{errors.name.message}</small>
          )}
        </div>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* FRECUENCIA */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <div className="field col-12 md:col-4">
          <label
            htmlFor="frequency"
            className="font-medium text-900 block mb-2"
          >
            Frecuencia <span className="text-red-500">*</span>
          </label>
          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <Dropdown
                id="frequency"
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
                options={FREQUENCY_OPTIONS}
                placeholder="Seleccionar frecuencia"
                className={classNames({ "p-invalid": errors.frequency })}
              />
            )}
          />
          {errors.frequency && (
            <small className="p-error">{errors.frequency.message}</small>
          )}
        </div>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* FECHA INICIO */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <div className="field col-12 md:col-4">
          <label
            htmlFor="startDate"
            className="font-medium text-900 block mb-2"
          >
            Fecha de Inicio <span className="text-red-500">*</span>
          </label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <Calendar
                id="startDate"
                value={field.value ? new Date(field.value) : null}
                onChange={(e) => {
                  const d = e.value as Date | null;
                  field.onChange(d ? d.toISOString().split("T")[0] : "");
                }}
                dateFormat="yy-mm-dd"
                showIcon
                className={classNames({ "p-invalid": errors.startDate })}
              />
            )}
          />
          {errors.startDate && (
            <small className="p-error">{errors.startDate.message}</small>
          )}
        </div>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* FECHA FIN */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <div className="field col-12 md:col-4">
          <label htmlFor="endDate" className="font-medium text-900 block mb-2">
            Fecha de Fin <span className="text-red-500">*</span>
          </label>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <Calendar
                id="endDate"
                value={field.value ? new Date(field.value) : null}
                onChange={(e) => {
                  const d = e.value as Date | null;
                  field.onChange(d ? d.toISOString().split("T")[0] : "");
                }}
                dateFormat="yy-mm-dd"
                showIcon
                className={classNames({ "p-invalid": errors.endDate })}
              />
            )}
          />
          {errors.endDate && (
            <small className="p-error">{errors.endDate.message}</small>
          )}
        </div>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* FECHA DE PAGO */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <div className="field col-12 md:col-4">
          <label
            htmlFor="paymentDate"
            className="font-medium text-900 block mb-2"
          >
            Fecha de Pago <span className="text-red-500">*</span>
          </label>
          <Controller
            name="paymentDate"
            control={control}
            render={({ field }) => (
              <Calendar
                id="paymentDate"
                value={field.value ? new Date(field.value) : null}
                onChange={(e) => {
                  const d = e.value as Date | null;
                  field.onChange(d ? d.toISOString().split("T")[0] : "");
                }}
                dateFormat="yy-mm-dd"
                showIcon
                className={classNames({ "p-invalid": errors.paymentDate })}
              />
            )}
          />
          {errors.paymentDate && (
            <small className="p-error">{errors.paymentDate.message}</small>
          )}
        </div>
      </div>
    </form>
  );
};

export default PayrollPeriodForm;
