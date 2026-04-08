"use client";

import { Controller, UseFormReturn } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { classNames } from "primereact/utils";
import SalaryInput from "@/shared/components/SalaryInput";
import { usePositionsData } from "@/modules/nomina/positions/hooks/usePositionsData";
import { useDepartmentsData } from "@/modules/nomina/departments/hooks/useDepartmentsData";
import { useEmployeesData } from "@/modules/nomina/employees/hooks/useEmployeesData";

interface LaboralDataSectionProps {
  form: UseFormReturn<any>;
}

const CONTRACT_TYPE_OPTIONS = [
  { label: "Indefinido", value: "INDEFINITE" },
  { label: "Determinado", value: "FIXED_TERM" },
  { label: "Por Obra", value: "PROJECT" },
  { label: "Pasantía", value: "INTERNSHIP" },
];

const WORK_SHIFT_OPTIONS = [
  { label: "Tiempo Completo", value: "FULL_TIME" },
  { label: "Tiempo Parcial", value: "PART_TIME" },
  { label: "Mixta", value: "MIXED" },
  { label: "Nocturna", value: "NIGHT" },
];

const PAY_FREQUENCY_OPTIONS = [
  { label: "Semanal", value: "WEEKLY" },
  { label: "Quincenal", value: "BIWEEKLY" },
  { label: "Mensual", value: "MONTHLY" },
];

const CURRENCY_OPTIONS = [
  { label: "Bolívares (VES)", value: "VES" },
  { label: "Dólares (USD)", value: "USD" },
];

export default function LaboralDataSection({ form }: LaboralDataSectionProps) {
  const {
    control,
    register,
    formState: { errors },
    watch,
  } = form;
  const { positions, loading: posLoading } = usePositionsData();
  const { departments, loading: deptLoading } = useDepartmentsData();
  const { employees, loading: empLoading } = useEmployeesData(0, 100);

  const currency = watch("currency");

  const positionOptions = positions.map((p) => ({
    label: p.name,
    value: p.id,
  }));
  const departmentOptions = departments.map((d) => ({
    label: d.name,
    value: d.id,
  }));
  const supervisorOptions = employees.map((e) => ({
    label: `${e.firstName} ${e.lastName}`,
    value: e.id,
  }));

  return (
    <div className="grid formgrid">
      <div className="field col-12 md:col-6 lg:col-3">
        <label
          htmlFor="employeeCode"
          className="font-medium text-900 block mb-2"
        >
          Código de Empleado <span className="text-red-500">*</span>
        </label>
        <InputText
          id="employeeCode"
          {...register("employeeCode")}
          className={classNames({ "p-invalid": errors.employeeCode })}
          placeholder="Ej: EMP-001"
        />
        {errors.employeeCode && (
          <small className="p-error">{errors.employeeCode.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label htmlFor="hireDate" className="font-medium text-900 block mb-2">
          Fecha de Ingreso <span className="text-red-500">*</span>
        </label>
        <Controller
          name="hireDate"
          control={control}
          render={({ field }) => (
            <Calendar
              id="hireDate"
              value={field.value ? new Date(field.value) : null}
              onChange={(e) =>
                field.onChange(e.value?.toISOString().split("T")[0])
              }
              dateFormat="dd/mm/yy"
              showIcon
              className={classNames("w-full", { "p-invalid": errors.hireDate })}
            />
          )}
        />
        {errors.hireDate && (
          <small className="p-error">{errors.hireDate.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label
          htmlFor="departmentId"
          className="font-medium text-900 block mb-2"
        >
          Departamento <span className="text-red-500">*</span>
        </label>
        <Controller
          name="departmentId"
          control={control}
          render={({ field }) => (
            <Dropdown
              id="departmentId"
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={departmentOptions}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar"
              loading={deptLoading}
              className={classNames("w-full", {
                "p-invalid": errors.departmentId,
              })}
            />
          )}
        />
        {errors.departmentId && (
          <small className="p-error">{errors.departmentId.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label htmlFor="positionId" className="font-medium text-900 block mb-2">
          Cargo <span className="text-red-500">*</span>
        </label>
        <Controller
          name="positionId"
          control={control}
          render={({ field }) => (
            <Dropdown
              id="positionId"
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={positionOptions}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar"
              loading={posLoading}
              className={classNames("w-full", {
                "p-invalid": errors.positionId,
              })}
            />
          )}
        />
        {errors.positionId && (
          <small className="p-error">{errors.positionId.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label
          htmlFor="contractType"
          className="font-medium text-900 block mb-2"
        >
          Tipo de Contrato <span className="text-red-500">*</span>
        </label>
        <Controller
          name="contractType"
          control={control}
          render={({ field }) => (
            <Dropdown
              id="contractType"
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={CONTRACT_TYPE_OPTIONS}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar"
              className={classNames("w-full", {
                "p-invalid": errors.contractType,
              })}
            />
          )}
        />
        {errors.contractType && (
          <small className="p-error">{errors.contractType.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label htmlFor="workShift" className="font-medium text-900 block mb-2">
          Tipo de Jornada <span className="text-red-500">*</span>
        </label>
        <Controller
          name="workShift"
          control={control}
          render={({ field }) => (
            <Dropdown
              id="workShift"
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={WORK_SHIFT_OPTIONS}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar"
              className={classNames("w-full", {
                "p-invalid": errors.workShift,
              })}
            />
          )}
        />
        {errors.workShift && (
          <small className="p-error">{errors.workShift.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label
          htmlFor="payFrequency"
          className="font-medium text-900 block mb-2"
        >
          Frecuencia de Pago <span className="text-red-500">*</span>
        </label>
        <Controller
          name="payFrequency"
          control={control}
          render={({ field }) => (
            <Dropdown
              id="payFrequency"
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={PAY_FREQUENCY_OPTIONS}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar"
              className={classNames("w-full", {
                "p-invalid": errors.payFrequency,
              })}
            />
          )}
        />
        {errors.payFrequency && (
          <small className="p-error">{errors.payFrequency.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label htmlFor="costCenter" className="font-medium text-900 block mb-2">
          Centro de Costo
        </label>
        <InputText
          id="costCenter"
          {...register("costCenter")}
          placeholder="Ej: CC-001"
        />
      </div>

      <div className="field col-12 md:col-6 lg:col-4">
        <label
          htmlFor="salaryAmount"
          className="font-medium text-900 block mb-2"
        >
          Salario Base <span className="text-red-500">*</span>
        </label>
        <Controller
          name="salaryAmount"
          control={control}
          render={({ field }) => (
            <SalaryInput
              value={field.value}
              onChange={field.onChange}
              currency={currency}
              className={classNames({ "p-invalid": errors.salaryAmount })}
            />
          )}
        />
        {errors.salaryAmount && (
          <small className="p-error">{errors.salaryAmount.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-4">
        <label htmlFor="currency" className="font-medium text-900 block mb-2">
          Moneda <span className="text-red-500">*</span>
        </label>
        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <Dropdown
              id="currency"
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={CURRENCY_OPTIONS}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar"
              className={classNames("w-full", { "p-invalid": errors.currency })}
            />
          )}
        />
        {errors.currency && (
          <small className="p-error">{errors.currency.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-4">
        <label
          htmlFor="supervisorId"
          className="font-medium text-900 block mb-2"
        >
          Supervisor
        </label>
        <Controller
          name="supervisorId"
          control={control}
          render={({ field }) => (
            <Dropdown
              id="supervisorId"
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={supervisorOptions}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar (opcional)"
              loading={empLoading}
              showClear
              className="w-full"
            />
          )}
        />
      </div>
    </div>
  );
}
