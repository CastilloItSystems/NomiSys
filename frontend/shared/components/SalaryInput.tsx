"use client";

import { InputNumber } from "primereact/inputnumber";
import { forwardRef } from "react";

interface SalaryInputProps {
  value?: number;
  onChange?: (value: number | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  currency?: "VES" | "USD";
}

/**
 * Salary Input Component
 * Decimal format, minimum 0, two decimal places
 */
const SalaryInput = forwardRef<HTMLInputElement, SalaryInputProps>(
  (
    {
      value = 0,
      onChange,
      onBlur,
      placeholder = "0.00",
      className = "",
      disabled = false,
      currency = "VES",
    },
    ref,
  ) => {
    return (
      <InputNumber
        ref={ref as any}
        value={value}
        onValueChange={(e) => onChange?.(e.value ?? null)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        minFractionDigits={2}
        maxFractionDigits={2}
        min={0}
        prefix={currency === "VES" ? "Bs. " : "$ "}
        locale="es-VE"
        useGrouping
      />
    );
  },
);

SalaryInput.displayName = "SalaryInput";

export default SalaryInput;
