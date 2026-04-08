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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Row 1: Names */}
      <div className="field">
        <label htmlFor="firstName">
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

      <div className="field">
        <label htmlFor="middleName">Segundo Nombre</label>
        <InputText
          id="middleName"
          {...register("middleName")}
          placeholder="Ej: Carlos"
        />
      </div>

      <div className="field">
        <label htmlFor="lastName">
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

      <div className="field">
        <label htmlFor="secondLastName">Segundo Apellido</label>
        <InputText
          id="secondLastName"
          {...register("secondLastName")}
          placeholder="Ej: García"
        />
      </div>

      {/* Row 2: Document */}
      <div className="field">
        <label htmlFor="documentType">
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

      <div className="field">
        <label htmlFor="documentNumber">
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

      {/* Row 3: Birth Data */}
      <div className="field">
        <label htmlFor="birthDate">
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

      <div className="field">
        <label htmlFor="gender">
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
              className={classNames({ "p-invalid": errors.gender })}
            />
          )}
        />
        {errors.gender && (
          <small className="p-error">{errors.gender.message}</small>
        )}
      </div>

      {/* Row 4: Contact & Birth Place */}
      <div className="field">
        <label htmlFor="phone">
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

      <div className="field">
        <label htmlFor="email">Correo Electrónico</label>
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

      {/* Row 5: Address */}
      <div className="field col-span-full md:col-span-1">
        <label htmlFor="address">
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

      <div className="field">
        <label htmlFor="birthPlace">Lugar de Nacimiento</label>
        <InputText
          id="birthPlace"
          {...register("birthPlace")}
          placeholder="Ciudad, Estado"
        />
      </div>

      {/* Row 6: Additional Personal Info */}
      <div className="field">
        <label htmlFor="nationality">Nacionalidad</label>
        <InputText
          id="nationality"
          {...register("nationality")}
          placeholder="Ej: Venezolana"
        />
      </div>

      <div className="field">
        <label htmlFor="maritalStatus">Estado Civil</label>
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
            />
          )}
        />
      </div>

      {/* Row 7: Dependents */}
      <div className="field">
        <label htmlFor="dependents">Cargas Familiares</label>
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
