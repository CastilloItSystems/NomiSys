"use client";

import { UseFormReturn } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import VenezuelaPhoneInput from "@/shared/components/VenezuelaPhoneInput";
import { Controller } from "react-hook-form";

interface AdditionalDataSectionProps {
  form: UseFormReturn<any>;
}

export default function AdditionalDataSection({
  form,
}: AdditionalDataSectionProps) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  return (
    <div className="grid formgrid">
      <div className="field col-12 md:col-6">
        <label
          htmlFor="emergencyContactName"
          className="font-medium text-900 block mb-2"
        >
          Nombre Contacto de Emergencia
        </label>
        <InputText
          id="emergencyContactName"
          {...register("emergencyContactName")}
          placeholder="Nombre completo"
          maxLength={100}
          className={classNames({ "p-invalid": errors.emergencyContactName })}
        />
        {errors.emergencyContactName && (
          <small className="p-error">
            {errors.emergencyContactName.message}
          </small>
        )}
      </div>

      <div className="field col-12 md:col-6">
        <label
          htmlFor="emergencyContactPhone"
          className="font-medium text-900 block mb-2"
        >
          Teléfono Contacto de Emergencia
        </label>
        <Controller
          name="emergencyContactPhone"
          control={control}
          render={({ field }) => (
            <VenezuelaPhoneInput
              value={field.value}
              onChange={field.onChange}
              placeholder="+58 o 04XX"
            />
          )}
        />
      </div>

      <div className="field col-12">
        <label
          htmlFor="observations"
          className="font-medium text-900 block mb-2"
        >
          Observaciones
        </label>
        <InputText
          id="observations"
          {...register("observations")}
          placeholder="Notas adicionales sobre el empleado"
          maxLength={500}
          className={classNames({ "p-invalid": errors.observations })}
        />
        {errors.observations && (
          <small className="p-error">{errors.observations.message}</small>
        )}
      </div>
    </div>
  );
}
