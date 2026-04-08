"use client";

import { useRef, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { classNames } from "primereact/utils";
import { usePositionsData } from "@/modules/nomina/positions/hooks/usePositionsData";
import {
  createPosition,
  updatePosition,
  deletePosition,
} from "@/modules/nomina/positions/services/position.service";
import {
  createPositionSchema,
  CreatePositionFormData,
} from "@/modules/nomina/positions/schemas/position.schema";
import { Position } from "@/modules/nomina/positions/interfaces/position.interface";
import { handleFormError } from "@/utils/errorHandlers";

interface PositionFormProps {
  position?: Position | null;
  onSave: () => void;
  onCancel: () => void;
  formId?: string;
}

const PositionForm = ({
  position,
  onSave,
  onCancel,
  formId = "position-form",
}: PositionFormProps) => {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePositionFormData>({
    resolver: zodResolver(createPositionSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (position) {
      reset({
        name: position.name,
        code: position.code || "",
        description: position.description || "",
        level: position.level || undefined,
        isActive: position.isActive,
      });
    } else {
      reset({
        name: "",
        code: "",
        description: "",
        level: undefined,
        isActive: true,
      });
    }
  }, [position, reset]);

  const onSubmit = async (data: CreatePositionFormData) => {
    try {
      setIsSubmitting(true);
      if (position?.id) {
        await updatePosition(position.id, data);
        toast.current?.show({
          severity: "success",
          summary: "Éxito",
          detail: "Cargo actualizado",
          life: 3000,
        });
      } else {
        await createPosition(data);
        toast.current?.show({
          severity: "success",
          summary: "Éxito",
          detail: "Cargo creado",
          life: 3000,
        });
      }
      onSave();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <form onSubmit={handleSubmit(onSubmit)} id={formId}>
        <div className="field">
          <label htmlFor="name">
            Nombre <span className="text-red-500">*</span>
          </label>
          <InputText
            id="name"
            {...register("name")}
            className={classNames({ "p-invalid": errors.name })}
            placeholder="Ej: Gerente de Ventas"
          />
          {errors.name && (
            <small className="p-error">{errors.name.message}</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="code">Código</label>
          <InputText
            id="code"
            {...register("code")}
            className={classNames({ "p-invalid": errors.code })}
            placeholder="Ej: GER-VENTAS"
            maxLength={20}
          />
        </div>

        <div className="field">
          <label htmlFor="description">Descripción</label>
          <InputText
            id="description"
            {...register("description")}
            className={classNames({ "p-invalid": errors.description })}
            placeholder="Descripción del cargo"
            maxLength={500}
          />
        </div>

        <div className="field">
          <label htmlFor="level">Nivel Jerárquico</label>
          <Controller
            name="level"
            control={control}
            render={({ field }) => (
              <InputNumber
                id="level"
                value={field.value}
                onValueChange={(e) => field.onChange(e.value)}
                placeholder="Nivel"
                min={1}
              />
            )}
          />
        </div>

        <div className="field">
          <label htmlFor="isActive">Activo</label>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <InputSwitch
                id="isActive"
                checked={field.value}
                onChange={(e) => field.onChange(e.value)}
              />
            )}
          />
        </div>
      </form>
    </>
  );
};

export default function PositionsList() {
  const toast = useRef<Toast>(null);
  const { positions, loading, mutate } = usePositionsData();

  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null,
  );
  const [positionFormDialog, setPositionFormDialog] = useState(false);
  const [deletePositionDialog, setDeletePositionDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const editPosition = (pos: Position) => {
    setSelectedPosition(pos);
    setPositionFormDialog(true);
  };

  const confirmDeletePosition = (pos: Position) => {
    setSelectedPosition(pos);
    setDeletePositionDialog(true);
  };

  const deletePos = async () => {
    if (!selectedPosition?.id) return;
    try {
      setIsDeleting(true);
      await deletePosition(selectedPosition.id);
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Cargo eliminado",
        life: 3000,
      });
      setDeletePositionDialog(false);
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setIsDeleting(false);
    }
  };

  const hideFormDialog = () => {
    setSelectedPosition(null);
    setPositionFormDialog(false);
  };

  const actionBodyTemplate = (rowData: Position) => {
    return (
      <Button
        icon="pi pi-ellipsis-v"
        rounded
        text
        onClick={() => {
          setSelectedPosition(rowData);
        }}
      />
    );
  };

  return (
    <>
      <Toast ref={toast} />

      <div className="flex align-items-center justify-content-between mb-4">
        <h3>Cargos</h3>
        <Button
          label="Nuevo Cargo"
          icon="pi pi-plus"
          onClick={() => {
            setSelectedPosition(null);
            setPositionFormDialog(true);
          }}
        />
      </div>

      <DataTable
        value={positions}
        loading={loading}
        paginator
        rows={10}
        scrollable
        emptyMessage="Sin cargos"
      >
        <Column field="name" header="Nombre" sortable />
        <Column field="code" header="Código" sortable />
        <Column field="level" header="Nivel" sortable />
        <Column
          field="isActive"
          header="Activo"
          body={(rowData) => (
            <i
              className={classNames("pi", {
                "text-green-500 pi-check": rowData.isActive,
                "text-gray-400 pi-times": !rowData.isActive,
              })}
            />
          )}
        />
        <Column
          header="Acciones"
          body={actionBodyTemplate}
          frozen
          alignFrozen="right"
        />
      </DataTable>

      <Dialog
        visible={positionFormDialog}
        style={{ width: "500px" }}
        header={selectedPosition ? "Editar Cargo" : "Nuevo Cargo"}
        modal
        onHide={hideFormDialog}
        footer={
          <div className="flex gap-2 justify-content-end">
            <Button label="Cancelar" onClick={hideFormDialog} />
            <Button label="Guardar" form="position-form" />
          </div>
        }
      >
        <PositionForm
          position={selectedPosition}
          onSave={() => {
            hideFormDialog();
            mutate();
          }}
          onCancel={hideFormDialog}
          formId="position-form"
        />
      </Dialog>

      <Dialog
        visible={deletePositionDialog}
        style={{ width: "450px" }}
        header="Confirmar"
        modal
        footer={
          <div className="flex gap-2 justify-content-end">
            <Button label="No" onClick={() => setDeletePositionDialog(false)} />
            <Button
              label="Sí, eliminar"
              severity="danger"
              loading={isDeleting}
              onClick={deletePos}
            />
          </div>
        }
        onHide={() => setDeletePositionDialog(false)}
      >
        <div className="flex gap-3 align-items-center">
          <i className="pi pi-exclamation-triangle text-red-500 text-2xl" />
          <span>
            ¿Estás seguro de que deseas eliminar <b>{selectedPosition?.name}</b>
            ?
          </span>
        </div>
      </Dialog>
    </>
  );
}
