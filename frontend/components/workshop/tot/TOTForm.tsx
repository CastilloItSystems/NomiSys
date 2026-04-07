"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import FormActionButtons from "@/components/common/FormActionButtons";
import { totService } from "@/app/api/workshop";
import supplierService, { type Supplier } from "@/app/api/inventory/supplierService";
import { createTOTSchema, type CreateTOTFormValues } from "@/libs/zods/workshop";
import type { WorkshopTOT, CreateTOTInput, UpdateTOTInput } from "@/libs/interfaces/workshop";

interface Props {
  item?: WorkshopTOT | null;
  serviceOrderId?: string;
  onSaved: () => void;
  onCancel: () => void;
}

export default function TOTForm({ item, serviceOrderId, onSaved, onCancel }: Props) {
  const isEdit = !!item;
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTOTFormValues>({
    resolver: zodResolver(createTOTSchema),
    defaultValues: {
      serviceOrderId: item?.serviceOrderId ?? serviceOrderId ?? "",
      supplierId: item?.supplierId ?? null,
      providerName: item?.providerName ?? null,
      partDescription: item?.partDescription ?? "",
      partSerial: item?.partSerial ?? null,
      requestedWork: item?.requestedWork ?? "",
      technicalInstruction: item?.technicalInstruction ?? null,
      estimatedReturnAt: item?.estimatedReturnAt ? item.estimatedReturnAt.split("T")[0] : null,
      providerQuote: item?.providerQuote ?? null,
      notes: item?.notes ?? null,
    },
  });

  useEffect(() => {
    supplierService
      .getAll({ isActive: "true", limit: 200 } as any)
      .then((res) => setSuppliers(res.data ?? []))
      .catch(() => {});
  }, []);

  const onSubmit = async (values: CreateTOTFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEdit && item) {
        const payload: UpdateTOTInput = {
          supplierId: values.supplierId,
          providerName: values.providerName,
          partDescription: values.partDescription,
          partSerial: values.partSerial,
          requestedWork: values.requestedWork,
          technicalInstruction: values.technicalInstruction,
          estimatedReturnAt: values.estimatedReturnAt,
          providerQuote: values.providerQuote,
          notes: values.notes,
        };
        await totService.update(item.id, payload);
      } else {
        const payload: CreateTOTInput = {
          serviceOrderId: values.serviceOrderId,
          supplierId: values.supplierId,
          providerName: values.providerName,
          partDescription: values.partDescription,
          partSerial: values.partSerial,
          requestedWork: values.requestedWork,
          technicalInstruction: values.technicalInstruction,
          estimatedReturnAt: values.estimatedReturnAt,
          providerQuote: values.providerQuote,
          notes: values.notes,
        };
        await totService.create(payload);
      }
      onSaved();
    } finally {
      setIsSubmitting(false);
    }
  };

  const supplierOptions = suppliers.map((s) => ({
    label: `${s.code} - ${s.name}${s.specialty ? ` (${s.specialty})` : ""}`,
    value: s.id,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
      <div className="grid formgrid gap-3">
        {/* Proveedor (Supplier) */}
        <div className="col-12 md:col-6">
          <label className="font-semibold">Proveedor (catálogo)</label>
          <Controller
            name="supplierId"
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                options={supplierOptions}
                placeholder="Seleccionar proveedor"
                showClear
                filter
                className="w-full"
              />
            )}
          />
        </div>

        {/* Nombre libre */}
        <div className="col-12 md:col-6">
          <label className="font-semibold">Nombre libre del proveedor</label>
          <Controller
            name="providerName"
            control={control}
            render={({ field }) => (
              <InputText
                {...field}
                value={field.value ?? ""}
                placeholder="Si no está en catálogo"
                className="w-full"
              />
            )}
          />
        </div>

        {/* Descripción de la pieza */}
        <div className="col-12">
          <label className="font-semibold">
            Descripción de la pieza <span className="text-red-500">*</span>
          </label>
          <Controller
            name="partDescription"
            control={control}
            render={({ field }) => (
              <InputTextarea {...field} rows={2} className="w-full" autoResize />
            )}
          />
          {errors.partDescription && (
            <small className="text-red-500">{errors.partDescription.message}</small>
          )}
        </div>

        {/* Serial */}
        <div className="col-12 md:col-6">
          <label className="font-semibold">Serial / identificación</label>
          <Controller
            name="partSerial"
            control={control}
            render={({ field }) => (
              <InputText {...field} value={field.value ?? ""} className="w-full" />
            )}
          />
        </div>

        {/* Fecha estimada retorno */}
        <div className="col-12 md:col-6">
          <label className="font-semibold">Fecha estimada de retorno</label>
          <Controller
            name="estimatedReturnAt"
            control={control}
            render={({ field }) => (
              <Calendar
                value={field.value ? new Date(field.value) : null}
                onChange={(e) =>
                  field.onChange(
                    e.value ? (e.value as Date).toISOString().split("T")[0] : null
                  )
                }
                dateFormat="dd/mm/yy"
                showIcon
                className="w-full"
              />
            )}
          />
        </div>

        {/* Trabajo solicitado */}
        <div className="col-12">
          <label className="font-semibold">
            Trabajo solicitado <span className="text-red-500">*</span>
          </label>
          <Controller
            name="requestedWork"
            control={control}
            render={({ field }) => (
              <InputTextarea {...field} rows={3} className="w-full" autoResize />
            )}
          />
          {errors.requestedWork && (
            <small className="text-red-500">{errors.requestedWork.message}</small>
          )}
        </div>

        {/* Instrucción técnica */}
        <div className="col-12">
          <label className="font-semibold">Instrucción técnica</label>
          <Controller
            name="technicalInstruction"
            control={control}
            render={({ field }) => (
              <InputTextarea
                {...field}
                value={field.value ?? ""}
                rows={2}
                className="w-full"
                autoResize
              />
            )}
          />
        </div>

        {/* Presupuesto proveedor */}
        <div className="col-12 md:col-6">
          <label className="font-semibold">Presupuesto proveedor</label>
          <Controller
            name="providerQuote"
            control={control}
            render={({ field }) => (
              <InputNumber
                value={field.value ?? null}
                onValueChange={(e) => field.onChange(e.value ?? null)}
                mode="currency"
                currency="USD"
                locale="es-VE"
                className="w-full"
              />
            )}
          />
        </div>

        {/* Notas */}
        <div className="col-12">
          <label className="font-semibold">Notas</label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <InputTextarea
                {...field}
                value={field.value ?? ""}
                rows={2}
                className="w-full"
                autoResize
              />
            )}
          />
        </div>
      </div>

      <div className="mt-4">
        <FormActionButtons
          isSubmitting={isSubmitting}
          isEdit={isEdit}
          onCancel={onCancel}
        />
      </div>
    </form>
  );
}
