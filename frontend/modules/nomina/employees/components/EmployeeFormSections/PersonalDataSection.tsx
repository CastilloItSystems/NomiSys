"use client";

import { Controller, UseFormReturn } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { classNames } from "primereact/utils";
import DocumentTypeSelect from "@/shared/components/DocumentTypeSelect";
import DocumentNumberInput from "@/shared/components/DocumentNumberInput";
import VenezuelaPhoneInput from "@/shared/components/VenezuelaPhoneInput";
import { PersonalDataFormData } from "@/modules/nomina/employees/schemas/employee.schema";

interface PersonalDataSectionProps {
  form: UseFormReturn<any>;
}

const GENDER_OPTIONS = [
  { label: "Masculino", value: "M" },
  { label: "Femenino", value: "F" },
  { label: "Otro", value: "O" },
];

const MARITAL_STATUS_OPTIONS = [
  { label: "Soltero/a", value: "SINGLE" },
  { label: "Casado/a", value: "MARRIED" },
  { label: "Divorciado/a", value: "DIVORCED" },
  { label: "Viudo/a", value: "WIDOWED" },
  { label: "Unión Estable", value: "DOMESTIC_PARTNERSHIP" },
];

export default function PersonalDataSection({
  form,
}: PersonalDataSectionProps) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  return (
    <div className="grid formgrid">
      {/* Nombres */}
      <div className="field col-12 md:col-6 lg:col-3">
        <label htmlFor="firstName" className="font-medium text-900 block mb-2">
          Primer Nombre <span className="text-red-500">*</span>
        </label>
        <InputText
          id="firstName"
          {...register("firstName")}
          className={classNames({ "p-invalid": errors.firstName })}
          placeholder="Ej: Juan"
        />
        {errors.firstName && (
          <small className="p-error">{errors.firstName.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label htmlFor="middleName" className="font-medium text-900 block mb-2">
          Segundo Nombre
        </label>
        <InputText
          id="middleName"
          {...register("middleName")}
          placeholder="Ej: Carlos"
        />
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label htmlFor="lastName" className="font-medium text-900 block mb-2">
          Primer Apellido <span className="text-red-500">*</span>
        </label>
        <InputText
          id="lastName"
          {...register("lastName")}
          className={classNames({ "p-invalid": errors.lastName })}
          placeholder="Ej: Pérez"
        />
        {errors.lastName && (
          <small className="p-error">{errors.lastName.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label
          htmlFor="secondLastName"
          className="font-medium text-900 block mb-2"
        >
          Segundo Apellido
        </label>
        <InputText
          id="secondLastName"
          {...register("secondLastName")}
          placeholder="Ej: García"
        />
      </div>

      {/* Identidad y Nacimiento */}
      <div className="field col-12 md:col-6 lg:col-3">
        <label
          htmlFor="documentType"
          className="font-medium text-900 block mb-2"
        >
          Tipo de Documento <span className="text-red-500">*</span>
        </label>
        <Controller
          name="documentType"
          control={control}
          render={({ field }) => (
            <DocumentTypeSelect
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              className={classNames({ "p-invalid": errors.documentType })}
            />
          )}
        />
        {errors.documentType && (
          <small className="p-error">{errors.documentType.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label
          htmlFor="documentNumber"
          className="font-medium text-900 block mb-2"
        >
          Número de Documento <span className="text-red-500">*</span>
        </label>
        <Controller
          name="documentNumber"
          control={control}
          render={({ field }) => (
            <DocumentNumberInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              className={classNames({ "p-invalid": errors.documentNumber })}
            />
          )}
        />
        {errors.documentNumber && (
          <small className="p-error">{errors.documentNumber.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label htmlFor="birthDate" className="font-medium text-900 block mb-2">
          Fecha de Nacimiento <span className="text-red-500">*</span>
        </label>
        <Controller
          name="birthDate"
          control={control}
          render={({ field }) => (
            <Calendar
              id="birthDate"
              value={field.value ? new Date(field.value) : null}
              onChange={(e) =>
                field.onChange(e.value?.toISOString().split("T")[0])
              }
              dateFormat="dd/mm/yy"
              showIcon
              className={classNames("w-full", {
                "p-invalid": errors.birthDate,
              })}
            />
          )}
        />
        {errors.birthDate && (
          <small className="p-error">{errors.birthDate.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label htmlFor="gender" className="font-medium text-900 block mb-2">
          Género <span className="text-red-500">*</span>
        </label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Dropdown
              id="gender"
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={GENDER_OPTIONS}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar"
              className={classNames("w-full", { "p-invalid": errors.gender })}
            />
          )}
        />
        {errors.gender && (
          <small className="p-error">{errors.gender.message}</small>
        )}
      </div>

      {/* Contacto y Dirección */}
      <div className="field col-12 md:col-6 lg:col-3">
        <label htmlFor="phone" className="font-medium text-900 block mb-2">
          Teléfono <span className="text-red-500">*</span>
        </label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <VenezuelaPhoneInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              className={classNames({ "p-invalid": errors.phone })}
            />
          )}
        />
        {errors.phone && (
          <small className="p-error">{errors.phone.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-4">
        <label htmlFor="email" className="font-medium text-900 block mb-2">
          Correo Electrónico
        </label>
        <InputText
          id="email"
          type="email"
          {...register("email")}
          placeholder="email@example.com"
          className={classNames({ "p-invalid": errors.email })}
        />
        {errors.email && (
          <small className="p-error">{errors.email.message}</small>
        )}
      </div>

      <div className="field col-12 md:col-6 lg:col-5">
        <label htmlFor="address" className="font-medium text-900 block mb-2">
          Dirección <span className="text-red-500">*</span>
        </label>
        <InputText
          id="address"
          {...register("address")}
          className={classNames({ "p-invalid": errors.address })}
          placeholder="Dirección completa"
        />
        {errors.address && (
          <small className="p-error">{errors.address.message}</small>
        )}
      </div>

      {/* Otros Datos */}
      <div className="field col-12 md:col-6 lg:col-3">
        <label htmlFor="birthPlace" className="font-medium text-900 block mb-2">
          Lugar de Nacimiento
        </label>
        <InputText
          id="birthPlace"
          {...register("birthPlace")}
          placeholder="Ciudad, Estado"
        />
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label
          htmlFor="nationality"
          className="font-medium text-900 block mb-2"
        >
          Nacionalidad
        </label>
        <InputText
          id="nationality"
          {...register("nationality")}
          placeholder="Ej: Venezolana"
        />
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label
          htmlFor="maritalStatus"
          className="font-medium text-900 block mb-2"
        >
          Estado Civil
        </label>
        <Controller
          name="maritalStatus"
          control={control}
          render={({ field }) => (
            <Dropdown
              id="maritalStatus"
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={MARITAL_STATUS_OPTIONS}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar"
              className="w-full"
            />
          )}
        />
      </div>

      <div className="field col-12 md:col-6 lg:col-3">
        <label htmlFor="dependents" className="font-medium text-900 block mb-2">
          Cargas Familiares
        </label>
        <Controller
          name="dependents"
          control={control}
          render={({ field }) => (
            <InputNumber
              id="dependents"
              value={field.value}
              onValueChange={(e) => field.onChange(e.value ?? 0)}
              min={0}
              max={20}
              placeholder="0"
              className="w-full"
            />
          )}
        />
        {errors.dependents && (
          <small className="p-error">{errors.dependents.message}</small>
        )}
      </div>
    </div>
  );
}
