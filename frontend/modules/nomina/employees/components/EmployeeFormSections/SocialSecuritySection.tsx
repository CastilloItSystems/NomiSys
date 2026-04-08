"use client";

import { Controller, UseFormReturn } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { classNames } from "primereact/utils";

interface SocialSecuritySectionProps {
  form: UseFormReturn<any>;
}

export default function SocialSecuritySection({
  form,
}: SocialSecuritySectionProps) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  return (
    <div className="grid formgrid">
      <div className="field col-12 md:col-6">
        <label htmlFor="ivssNumber" className="font-medium text-900 block mb-2">
          Número IVSS
        </label>
        <InputText
          id="ivssNumber"
          {...register("ivssNumber")}
          placeholder="10-12 dígitos"
          className={classNames({ "p-invalid": errors.ivssNumber })}
        />
        {errors.ivssNumber && (
          <small className="p-error">{errors.ivssNumber.message}</small>
        )}
        <small className="text-gray-500 block mt-2">
          Seguro Social Obligatorio (opcional pero recomendado)
        </small>
      </div>

      <div className="field col-12 md:col-6">
        <label htmlFor="rifNumber" className="font-medium text-900 block mb-2">
          RIF del Empleado
        </label>
        <InputText
          id="rifNumber"
          {...register("rifNumber")}
          placeholder="J/V/E/G-XXXXXXXX-X"
          maxLength={17}
          className={classNames({ "p-invalid": errors.rifNumber })}
        />
        {errors.rifNumber && (
          <small className="p-error">{errors.rifNumber.message}</small>
        )}
        <small className="text-gray-500 block mt-2">
          Formato: J/V/E/G-XXXXXXXX-X (opcional)
        </small>
      </div>

      <div className="field col-12 md:col-6 flex flex-column">
        <label
          htmlFor="isFaovEnrolled"
          className="font-medium text-900 block mb-2"
        >
          Inscrito en FAOV
        </label>
        <Controller
          name="isFaovEnrolled"
          control={control}
          render={({ field }) => (
            <InputSwitch
              id="isFaovEnrolled"
              checked={field.value}
              onChange={(e) => field.onChange(e.value)}
            />
          )}
        />
        <small className="text-gray-500 block mt-2">
          Fondo de Ahorro y Jubilación Obligatorio
        </small>
      </div>

      <div className="field col-12 md:col-6 flex flex-column">
        <label
          htmlFor="isIncesEnrolled"
          className="font-medium text-900 block mb-2"
        >
          Inscrito en INCES
        </label>
        <Controller
          name="isIncesEnrolled"
          control={control}
          render={({ field }) => (
            <InputSwitch
              id="isIncesEnrolled"
              checked={field.value}
              onChange={(e) => field.onChange(e.value)}
            />
          )}
        />
        <small className="text-gray-500 block mt-2">
          Instituto Nacional de Capacitación y Educación Socialista
        </small>
      </div>

      <div className="col-12 p-4 mt-4 surface-card border-round-lg bg-blue-50 border-1 border-blue-200">
        <h4 className="mt-0 mb-2">
          ℹ️ Información de Seguridad Social Venezuela
        </h4>
        <ul className="text-sm list-disc list-inside m-0 space-y-1">
          <li>IVSS: Afiliación obligatoria para trabajadores privados</li>
          <li>RIF: Requerido para retenciones de ISLR</li>
          <li>FAOV: Obligatorio para empleados con salario superior a UIT</li>
          <li>INCES: Aporte patronal del 0.5% del salario</li>
        </ul>
      </div>
    </div>
  );
}
