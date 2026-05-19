"use client";

import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import useSWR from "swr";
import {
  getPayrollConfig,
  updatePayrollConfig,
  PayrollConfig,
} from "../services/payrollConfig.service";
import { handleFormError } from "@/utils/errorHandlers";

export default function PayrollConfigForm() {
  const toast = useRef<Toast>(null);
  const { data, mutate } = useSWR("payroll-config", getPayrollConfig, {
    revalidateOnFocus: false,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<Partial<PayrollConfig>>({
    defaultValues: {
      salarioMinimo: 0,
      salarioMinimoBs: 0,
      tasaCambio: 1,
      ivssRate: 0.04,
      faovRate: 0.01,
      incesRate: 0.005,
      ivssMaxSalarios: 5,
      bonoAlimentacion: 0,
      bonoAlimentacionAplica: true,
      utilidadesDias: 15,
      islrAplica: false,
      islrUMT: 0,
      prestacionesDiasGarantia: 15,
    },
  });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const onSubmit = async (formData: Partial<PayrollConfig>) => {
    try {
      await updatePayrollConfig(formData);
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Configuración actualizada",
        life: 3000,
      });
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    }
  };

  const NumberField = ({
    name,
    label,
    minFraction = 0,
    maxFraction = 2,
  }: {
    name: keyof PayrollConfig;
    label: string;
    minFraction?: number;
    maxFraction?: number;
  }) => (
    <div className="field">
      <label className="font-medium">{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <InputNumber
            value={field.value as number}
            onValueChange={(e) => field.onChange(e.value)}
            mode="decimal"
            minFractionDigits={minFraction}
            maxFractionDigits={maxFraction}
            className="w-full"
          />
        )}
      />
    </div>
  );

  const SwitchField = ({
    name,
    label,
  }: {
    name: keyof PayrollConfig;
    label: string;
  }) => (
    <div className="field flex align-items-center gap-3">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <InputSwitch
            checked={!!field.value}
            onChange={(e) => field.onChange(e.value)}
          />
        )}
      />
      <label className="font-medium">{label}</label>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-column gap-3 p-3"
      >
        <h4 className="m-0 mb-2">Configuración de Nómina</h4>

        {/* ── Tasas y salarios base ── */}
        <h6 className="m-0 text-600">Salario y Tasa de Cambio</h6>
        <div className="grid">
          <div className="col-12 md:col-6">
            <NumberField
              name="salarioMinimo"
              label="Salario Mínimo (USD)"
              minFraction={2}
              maxFraction={2}
            />
          </div>
          <div className="col-12 md:col-6">
            <NumberField
              name="salarioMinimoBs"
              label="Salario Mínimo (Bs)"
              minFraction={2}
              maxFraction={2}
            />
          </div>
          <div className="col-12 md:col-6">
            <NumberField
              name="tasaCambio"
              label="Tasa de Cambio (Bs/USD)"
              minFraction={2}
              maxFraction={6}
            />
          </div>
        </div>

        <Divider />

        {/* ── Seguridad social ── */}
        <h6 className="m-0 text-600">Seguridad Social</h6>
        <div className="grid">
          <div className="col-12 md:col-4">
            <NumberField
              name="ivssRate"
              label="Tasa IVSS (%)"
              minFraction={2}
              maxFraction={4}
            />
          </div>
          <div className="col-12 md:col-4">
            <NumberField
              name="faovRate"
              label="Tasa FAOV (%)"
              minFraction={2}
              maxFraction={4}
            />
          </div>
          <div className="col-12 md:col-4">
            <NumberField
              name="incesRate"
              label="Tasa INCES (%)"
              minFraction={2}
              maxFraction={4}
            />
          </div>
          <div className="col-12 md:col-4">
            <NumberField
              name="ivssMaxSalarios"
              label="Tope IVSS (# salarios mínimos)"
            />
          </div>
        </div>

        <Divider />

        {/* ── Bono de Alimentación ── */}
        <h6 className="m-0 text-600">Bono de Alimentación (Cesta Ticket)</h6>
        <div className="grid">
          <div className="col-12 md:col-4">
            <SwitchField
              name="bonoAlimentacionAplica"
              label="Aplica bono de alimentación"
            />
          </div>
          <div className="col-12 md:col-8">
            <NumberField
              name="bonoAlimentacion"
              label="Monto diario (Bs)"
              minFraction={2}
              maxFraction={2}
            />
          </div>
        </div>

        <Divider />

        {/* ── Utilidades ── */}
        <h6 className="m-0 text-600">Utilidades (LOTTT Art. 131)</h6>
        <div className="grid">
          <div className="col-12 md:col-4">
            <NumberField
              name="utilidadesDias"
              label="Días de utilidades (mín. 15)"
            />
          </div>
        </div>

        <Divider />

        {/* ── ISLR ── */}
        <h6 className="m-0 text-600">Retención ISLR</h6>
        <div className="grid">
          <div className="col-12 md:col-4">
            <SwitchField name="islrAplica" label="Aplica retención ISLR" />
          </div>
          <div className="col-12 md:col-8">
            <NumberField
              name="islrUMT"
              label="Unidad Municipal Tributaria (UMT)"
              minFraction={2}
              maxFraction={2}
            />
          </div>
        </div>

        <Divider />

        {/* ── Prestaciones Sociales ── */}
        <h6 className="m-0 text-600">Prestaciones Sociales (LOTTT Art. 142)</h6>
        <div className="grid">
          <div className="col-12 md:col-4">
            <NumberField
              name="prestacionesDiasGarantia"
              label="Días garantía por trimestre (mín. 15)"
            />
          </div>
        </div>

        <Button
          type="submit"
          label="Guardar Configuración"
          icon="pi pi-save"
          loading={isSubmitting}
          className="w-full mt-2"
        />
      </form>
    </>
  );
}
