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
import { InputSwitch } from "primereact/inputswitch";
import { classNames } from "primereact/utils";
import { useBanksData } from "@/modules/nomina/banks/hooks/useBanksData";
import {
  createBank,
  updateBank,
  deleteBank,
} from "@/modules/nomina/banks/services/bank.service";
import {
  createBankSchema,
  CreateBankFormData,
} from "@/modules/nomina/banks/schemas/bank.schema";
import { Bank } from "@/modules/nomina/banks/interfaces/bank.interface";
import { handleFormError } from "@/utils/errorHandlers";

interface BankFormProps {
  bank?: Bank | null;
  onSave: () => void;
  onCancel: () => void;
  formId?: string;
}

const BankForm = ({
  bank,
  onSave,
  onCancel,
  formId = "bank-form",
}: BankFormProps) => {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateBankFormData>({
    resolver: zodResolver(createBankSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (bank) {
      reset({
        name: bank.name,
        code: bank.code,
        isActive: bank.isActive,
      });
    } else {
      reset({
        name: "",
        code: "",
        isActive: true,
      });
    }
  }, [bank, reset]);

  const onSubmit = async (data: CreateBankFormData) => {
    try {
      setIsSubmitting(true);
      if (bank?.id) {
        await updateBank(bank.id, data);
        toast.current?.show({
          severity: "success",
          summary: "Éxito",
          detail: "Banco actualizado",
          life: 3000,
        });
      } else {
        await createBank(data);
        toast.current?.show({
          severity: "success",
          summary: "Éxito",
          detail: "Banco creado",
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
            placeholder="Ej: Banesco"
          />
          {errors.name && (
            <small className="p-error">{errors.name.message}</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="code">
            Código SUDEBAN <span className="text-red-500">*</span>
          </label>
          <InputText
            id="code"
            {...register("code")}
            className={classNames({ "p-invalid": errors.code })}
            placeholder="Ej: 0134"
            maxLength={10}
          />
          {errors.code && (
            <small className="p-error">{errors.code.message}</small>
          )}
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

export default function BanksList() {
  const toast = useRef<Toast>(null);
  const { banks, loading, mutate } = useBanksData();

  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [bankFormDialog, setBankFormDialog] = useState(false);
  const [deleteBankDialog, setDeleteBankDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const editBank = (b: Bank) => {
    setSelectedBank(b);
    setBankFormDialog(true);
  };

  const confirmDeleteBank = (b: Bank) => {
    setSelectedBank(b);
    setDeleteBankDialog(true);
  };

  const deleteB = async () => {
    if (!selectedBank?.id) return;
    try {
      setIsDeleting(true);
      await deleteBank(selectedBank.id);
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Banco eliminado",
        life: 3000,
      });
      setDeleteBankDialog(false);
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setIsDeleting(false);
    }
  };

  const hideFormDialog = () => {
    setSelectedBank(null);
    setBankFormDialog(false);
  };

  const actionBodyTemplate = (rowData: Bank) => {
    return (
      <Button
        icon="pi pi-ellipsis-v"
        rounded
        text
        onClick={() => {
          setSelectedBank(rowData);
        }}
      />
    );
  };

  return (
    <>
      <Toast ref={toast} />

      <div className="flex align-items-center justify-content-between mb-4">
        <h3>Bancos</h3>
        <Button
          label="Nuevo Banco"
          icon="pi pi-plus"
          onClick={() => {
            setSelectedBank(null);
            setBankFormDialog(true);
          }}
        />
      </div>

      <DataTable
        value={banks}
        loading={loading}
        paginator
        rows={10}
        scrollable
        emptyMessage="Sin bancos"
      >
        <Column field="name" header="Nombre" sortable />
        <Column field="code" header="Código SUDEBAN" sortable />
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
        visible={bankFormDialog}
        style={{ width: "500px" }}
        header={selectedBank ? "Editar Banco" : "Nuevo Banco"}
        modal
        onHide={hideFormDialog}
        footer={
          <div className="flex gap-2 justify-content-end">
            <Button label="Cancelar" onClick={hideFormDialog} />
            <Button label="Guardar" form="bank-form" />
          </div>
        }
      >
        <BankForm
          bank={selectedBank}
          onSave={() => {
            hideFormDialog();
            mutate();
          }}
          onCancel={hideFormDialog}
          formId="bank-form"
        />
      </Dialog>

      <Dialog
        visible={deleteBankDialog}
        style={{ width: "450px" }}
        header="Confirmar"
        modal
        footer={
          <div className="flex gap-2 justify-content-end">
            <Button label="No" onClick={() => setDeleteBankDialog(false)} />
            <Button
              label="Sí, eliminar"
              severity="danger"
              loading={isDeleting}
              onClick={deleteB}
            />
          </div>
        }
        onHide={() => setDeleteBankDialog(false)}
      >
        <div className="flex gap-3 align-items-center">
          <i className="pi pi-exclamation-triangle text-red-500 text-2xl" />
          <span>
            ¿Estás seguro de que deseas eliminar <b>{selectedBank?.name}</b>?
          </span>
        </div>
      </Dialog>
    </>
  );
}
