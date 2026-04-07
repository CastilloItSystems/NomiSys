"use client";

import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Checkbox } from "primereact/checkbox";
import { classNames } from "primereact/utils";
import PhoneInput from "../common/PhoneInput";

import {
  createUser,
  updateUser,
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from "@/app/api/userService";
import { handleFormError } from "@/utils/errorHandlers";
import {
  PasswordRequirements,
  passwordValidator,
  optionalPasswordValidator,
} from "./PasswordRequirements";

const baseUsuarioSchema = {
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Correo inválido"),
  phone: z.string().optional().or(z.literal("")),
  departments: z
    .array(z.string())
    .min(1, "Seleccione al menos un departamento"),
  access: z.enum(["full", "limited", "none"]),
  status: z.enum(["active", "pending", "suspended"]),
  isTechnician: z.boolean().optional(),
};

const createUserSchema = z
  .object({
    ...baseUsuarioSchema,
    password: passwordValidator,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

const updateUserSchema = z
  .object({
    ...baseUsuarioSchema,
    password: optionalPasswordValidator,
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Solo validamos coincidencia si se ingresó algo en la contraseña
      if (data.password) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    },
  );

type FormData = z.infer<typeof createUserSchema> &
  z.infer<typeof updateUserSchema>;

interface UsuarioFormProps {
  usuario?: User | null;
  onSave: () => void | Promise<void>;
  toast: React.RefObject<any>;
  formId?: string; // Permite inyectar un ID dinámico al form para conectarlo con botones externos
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

const estatusValues = [
  { label: "Activo", value: "active" },
  { label: "Pendiente", value: "pending" },
  { label: "Suspendido", value: "suspended" },
];

const accesoValues = [
  { label: "Completo", value: "full" },
  { label: "Limitado", value: "limited" },
  { label: "Ninguno", value: "none" },
];

const departamentoValues = [
  { label: "Ventas", value: "ventas" },
  { label: "Inventario", value: "inventario" },
  { label: "Administración", value: "administracion" },
  { label: "Servicios", value: "servicios" },
  { label: "Gerencia", value: "gerencia" },
];

const UsuarioForm = ({
  usuario,
  onSave,
  toast,
  formId = "usuario-form",
  onSubmittingChange,
}: UsuarioFormProps) => {
  const currentSchema = usuario ? updateUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    control,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(currentSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      departments: [],
      access: "none",
      status: "active",
      isTechnician: false,
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (usuario) {
      reset({
        name: usuario.name ?? "",
        email: usuario.email ?? "",
        phone: usuario.phone ?? "",
        departments: usuario.departments ?? [],
        access: usuario.access,
        status: usuario.status,
        isTechnician: usuario.isTechnician ?? false,
        password: "",
        confirmPassword: "",
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        departments: [],
        access: "none",
        status: "active",
        isTechnician: false,
        password: "",
        confirmPassword: "",
      });
    }
  }, [usuario, reset]);

  const onSubmit = async (data: FormData) => {
    if (onSubmittingChange) onSubmittingChange(true);
    try {
      const departmentsArray = data.departments;

      if (usuario?.id) {
        const payload: UpdateUserRequest = {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          departments: departmentsArray,
          access: data.access,
          status: data.status,
          isTechnician: data.isTechnician ?? false,
          ...(data.password ? { password: data.password } : {}),
        };

        await updateUser(usuario.id, payload);

        toast.current?.show({
          severity: "success",
          summary: "Éxito",
          detail: "Usuario actualizado correctamente",
          life: 3000,
        });
      } else {
        const payload: CreateUserRequest = {
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          departments: departmentsArray,
          access: data.access,
          status: data.status,
          password: data.password!, // Validated by createUserSchema
        };

        await createUser(payload);

        toast.current?.show({
          severity: "success",
          summary: "Éxito",
          detail: "Usuario creado correctamente",
          life: 3000,
        });
      }

      await onSave();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      if (onSubmittingChange) onSubmittingChange(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="p-fluid">
      <div className="grid">
        {/* Name */}
        <div className="col-12 md:col-6">
          <label htmlFor="name" className="block text-900 font-medium mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <InputText
                id="name"
                {...field}
                className={classNames("w-full", { "p-invalid": errors.name })}
                placeholder="Ej: Juan Pérez"
              />
            )}
          />
          {errors.name && (
            <small className="p-error block mt-1">{errors.name.message}</small>
          )}
        </div>

        {/* Email */}
        <div className="col-12 md:col-6">
          <label htmlFor="email" className="block text-900 font-medium mb-2">
            Correo <span className="text-red-500">*</span>
          </label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <InputText
                id="email"
                {...field}
                className={classNames("w-full", { "p-invalid": errors.email })}
                placeholder="Ej: correo@empresa.com"
              />
            )}
          />
          {errors.email && (
            <small className="p-error block mt-1">{errors.email.message}</small>
          )}
        </div>

        {/* Phone */}
        <div className="col-12 md:col-6">
          <label htmlFor="phone" className="block text-900 font-medium mb-2">
            Teléfono
          </label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                value={field.value ?? ""}
                onChange={field.onChange}
                className={classNames("w-full", {
                  "p-invalid": errors.phone,
                })}
              />
            )}
          />
          {errors.phone && (
            <small className="p-error block mt-1">{errors.phone.message}</small>
          )}
        </div>

        {/* Departments */}
        <div className="col-12 md:col-6">
          <label
            htmlFor="departments"
            className="block text-900 font-medium mb-2"
          >
            Departamento <span className="text-red-500">*</span>
          </label>
          <Controller
            name="departments"
            control={control}
            render={({ field }) => (
              <MultiSelect
                id="departments"
                value={field.value}
                options={departamentoValues}
                onChange={(e) => field.onChange(e.value)}
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione departamentos"
                display="chip"
                className={classNames("w-full", {
                  "p-invalid": errors.departments,
                })}
              />
            )}
          />
          {errors.departments && (
            <small className="p-error block mt-1">
              {errors.departments.message}
            </small>
          )}
        </div>

        {/* Access */}
        <div className="col-12 md:col-6">
          <label htmlFor="access" className="block text-900 font-medium mb-2">
            Acceso
          </label>
          <Controller
            name="access"
            control={control}
            render={({ field }) => (
              <Dropdown
                id="access"
                value={field.value}
                options={accesoValues}
                onChange={(e) => field.onChange(e.value)}
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione un acceso"
                className={classNames("w-full", { "p-invalid": errors.access })}
              />
            )}
          />
          {errors.access && (
            <small className="p-error block mt-1">
              {errors.access.message}
            </small>
          )}
        </div>

        {/* Status */}
        <div className="col-12 md:col-6">
          <label htmlFor="status" className="block text-900 font-medium mb-2">
            Estado
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Dropdown
                id="status"
                value={field.value}
                options={estatusValues}
                onChange={(e) => field.onChange(e.value)}
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione un estado"
                className={classNames("w-full", { "p-invalid": errors.status })}
              />
            )}
          />
          {errors.status && (
            <small className="p-error block mt-1">
              {errors.status.message}
            </small>
          )}
        </div>

        {/* Es técnico */}
        <div className="col-12 md:col-6">
          <label className="block text-900 font-medium mb-2">
            Rol de técnico
          </label>
          <Controller
            name="isTechnician"
            control={control}
            render={({ field }) => (
              <div className="flex align-items-center gap-2 mt-2">
                <Checkbox
                  inputId="isTechnician"
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.checked)}
                />
                <label htmlFor="isTechnician" className="cursor-pointer">
                  Es técnico de taller
                </label>
              </div>
            )}
          />
        </div>

        {/* Password */}
        <div className="col-12 md:col-6">
          <label htmlFor="password" className="block text-900 font-medium mb-2">
            {usuario ? "Nueva contraseña (opcional)" : "Contraseña"}
            {!usuario && <span className="text-red-500"> *</span>}
          </label>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Password
                id="password"
                toggleMask
                feedback={false}
                className={classNames("w-full", {
                  "p-invalid": errors.password,
                })}
                inputClassName="w-full"
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            )}
          />
          {errors.password && (
            <small className="p-error block mt-1">
              {errors.password.message}
            </small>
          )}
        </div>

        {/* Confirmar Password */}
        <div className="col-12 md:col-6">
          <label
            htmlFor="confirmPassword"
            className="block text-900 font-medium mb-2"
          >
            Confirmar contraseña
            {!usuario && <span className="text-red-500"> *</span>}
          </label>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Password
                id="confirmPassword"
                toggleMask
                feedback={false}
                className={classNames("w-full", {
                  "p-invalid": errors.confirmPassword,
                })}
                inputClassName="w-full"
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            )}
          />
          {errors.confirmPassword && (
            <small className="p-error block mt-1">
              {errors.confirmPassword.message}
            </small>
          )}
        </div>

        {/* Requisitos */}
        <div className="col-12">
          {(!usuario || watch("password")) && (
            <PasswordRequirements
              password={watch("password")}
              confirmPassword={watch("confirmPassword")}
              showConfirm={true}
            />
          )}
        </div>
      </div>
    </form>
  );
};

export default UsuarioForm;
