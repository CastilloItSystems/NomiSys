"use client";

import { Controller, UseFormReturn } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import { classNames } from "primereact/utils";
import AccountNumberInput from "@/shared/components/AccountNumberInput";
import { useBanksData } from "@/modules/nomina/banks/hooks/useBanksData";

interface BankingDataSectionProps {
  form: UseFormReturn<any>;
}

const ACCOUNT_TYPE_OPTIONS = [
  { label: "Ahorro", value: "SAVINGS" },
  { label: "Corriente", value: "CHECKING" },
];

export default function BankingDataSection({ form }: BankingDataSectionProps) {
  const {
    control,
    formState: { errors },
  } = form;
  const { banks, loading: banksLoading } = useBanksData();

  const bankOptions = banks.map((b) => ({ label: b.name, value: b.id }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="field">
        <label htmlFor="bankId">
          Banco <span className="text-red-500">*</span>
        </label>
        <Controller
          name="bankId"
          control={control}
          render={({ field }) => (
            <Dropdown
              id="bankId"
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={bankOptions}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar banco"
              loading={banksLoading}
              className={classNames({ "p-invalid": errors.bankId })}
            />
          )}
        />
        {errors.bankId && (
          <small className="p-error">{errors.bankId.message}</small>
        )}
      </div>

      <div className="field">
        <label htmlFor="accountType">
          Tipo de Cuenta <span className="text-red-500">*</span>
        </label>
        <Controller
          name="accountType"
          control={control}
          render={({ field }) => (
            <Dropdown
              id="accountType"
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={ACCOUNT_TYPE_OPTIONS}
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar tipo"
              className={classNames({ "p-invalid": errors.accountType })}
            />
          )}
        />
        {errors.accountType && (
          <small className="p-error">{errors.accountType.message}</small>
        )}
      </div>

      <div className="field col-span-full">
        <label htmlFor="accountNumber">
          Número de Cuenta <span className="text-red-500">*</span>
        </label>
        <Controller
          name="accountNumber"
          control={control}
          render={({ field }) => (
            <AccountNumberInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              className={classNames({ "p-invalid": errors.accountNumber })}
            />
          )}
        />
        {errors.accountNumber && (
          <small className="p-error">{errors.accountNumber.message}</small>
        )}
        <small className="text-gray-500 block mt-2">
          Debe tener exactamente 20 dígitos (estándar Venezuela)
        </small>
      </div>

      <div className="col-span-full p-4 surface-card border-round-lg bg-amber-50 border-1 border-amber-200">
        <h4 className="mt-0 mb-2">💳 Información Bancaria</h4>
        <ul className="text-sm list-disc list-inside m-0 space-y-1">
          <li>Este es el número de cuenta donde se depositarán los salarios</li>
          <li>Debe ser una cuenta válida a nombre del empleado</li>
          <li>No se pueden hacer depósitos antes de verificar la cuenta</li>
        </ul>
      </div>
    </div>
  );
}
