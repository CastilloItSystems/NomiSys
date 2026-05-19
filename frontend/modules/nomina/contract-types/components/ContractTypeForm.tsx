"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import FormActionButtons from "@/shared/components/FormActionButtons";
import {
  createContractTypeSchema,
  CreateContractTypeFormData,
} from "../schemas/contractType.schema";
import { ContractType } from "../interfaces/contractType.interface";
import {
  createContractType,
  updateContractType,
} from "../services/contractType.service";

interface Props {
  contractType?: ContractType | null;
  onSave: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
}

export default function ContractTypeForm({
  contractType,
  onSave,
  onCancel,
  isSubmitting,
  setIsSubmitting,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateContractTypeFormData>({
    resolver: zodResolver(createContractTypeSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    reset(
      contractType
        ? {
            name: contractType.name,
            description: contractType.description ?? "",
          }
        : { name: "", description: "" },
    );
  }, [contractType, reset]);

  const onSubmit = async (data: CreateContractTypeFormData) => {
    try {
      setIsSubmitting(true);
      if (contractType?.id) await updateContractType(contractType.id, data);
      else await createContractType(data);
      onSave();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column gap-3">
      <div className="field">
        <label>Nombre *</label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              className={`w-full ${errors.name ? "p-invalid" : ""}`}
            />
          )}
        />
        {errors.name && (
          <small className="p-error">{errors.name.message}</small>
        )}
      </div>
      <div className="field">
        <label>Descripción</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <InputTextarea {...field} className="w-full" rows={3} />
          )}
        />
      </div>
      <FormActionButtons
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitLabel={contractType?.id ? "Actualizar" : "Crear"}
      />
    </form>
  );
}
