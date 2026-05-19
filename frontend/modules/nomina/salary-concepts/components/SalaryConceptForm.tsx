"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";
import { Chips } from "primereact/chips";
import { Panel } from "primereact/panel";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import FormActionButtons from "@/shared/components/FormActionButtons";
import {
  createSalaryConceptSchema,
  CreateSalaryConceptFormData,
} from "../schemas/salaryConcept.schema";
import { SalaryConcept } from "../interfaces/salaryConcept.interface";
import {
  createSalaryConcept,
  updateSalaryConcept,
  validateConceptFormula,
  getAvailableVariables,
  AvailableVariables,
} from "../services/salaryConcept.service";
import { useContractTypesData } from "@/modules/nomina/contract-types/hooks/useContractTypesData";
import FormulaEditor from "./FormulaEditor";

const CONCEPT_TYPES = [
  { label: "Ingreso", value: "Ingreso" },
  { label: "Deducción", value: "Deducción" },
  { label: "Aporte Patronal", value: "Aporte Patronal" },
];

interface VariableInfo {
  name: string;
  description: string;
  example: number;
}


interface Props {
  concept?: SalaryConcept | null;
  onSave: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
}

export default function SalaryConceptForm({
  concept,
  onSave,
  onCancel,
  isSubmitting,
  setIsSubmitting,
}: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
  } | null>(null);
  const [availableVars, setAvailableVars] = useState<AvailableVariables | null>(null);
  const [varsLoading, setVarsLoading] = useState(false);
  const { contractTypes } = useContractTypesData();

  // Fetch available variables from backend
  useEffect(() => {
    const fetchVars = async () => {
      try {
        setVarsLoading(true);
        const data = await getAvailableVariables();
        setAvailableVars(data);
      } catch (error) {
        console.error('Error fetching available variables:', error);
      } finally {
        setVarsLoading(false);
      }
    };
    fetchVars();
  }, []);
  const contractTypeOptions = [
    { label: "Universal (todos los empleados)", value: null },
    ...contractTypes.map((ct) => ({ label: ct.name, value: ct.id })),
  ];

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateSalaryConceptFormData>({
    resolver: zodResolver(createSalaryConceptSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "Ingreso",
      description: "",
      isTaxable: false,
      formula: "",
      executionOrder: 0,
      inputVars: [],
      contractTypeId: null,
    },
  });

  useEffect(() => {
    if (concept) {
      reset({
        name: concept.name,
        code: concept.code,
        type: concept.type,
        description: concept.description ?? "",
        isTaxable: concept.isTaxable,
        formula: concept.formula ?? "",
        executionOrder: concept.executionOrder ?? 0,
        inputVars: concept.inputVars ?? [],
        contractTypeId: concept.contractTypeId ?? null,
      });
    } else {
      reset({
        name: "",
        code: "",
        type: "Ingreso",
        description: "",
        isTaxable: false,
        formula: "",
        executionOrder: 0,
        inputVars: [],
        contractTypeId: null,
      });
    }
    setValidationResult(null);
  }, [concept, reset]);

  const handleValidate = async () => {
    const formula = watch("formula");
    if (!formula?.trim()) return;
    try {
      setValidating(true);
      setValidationResult(null);
      const result = await validateConceptFormula(formula.trim());
      setValidationResult(result);
    } catch {
      setValidationResult({ valid: false, error: "Error al conectar con el servidor" });
    } finally {
      setValidating(false);
    }
  };

  const onSubmit = async (data: CreateSalaryConceptFormData) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        formula: data.formula || undefined,
        inputVars: data.inputVars ?? [],
        contractTypeId: data.contractTypeId ?? null,
      };
      if (concept?.id) {
        await updateSalaryConcept(concept.id, payload);
      } else {
        await createSalaryConcept(payload);
      }
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
              placeholder="Nombre del concepto"
            />
          )}
        />
        {errors.name && (
          <small className="p-error">{errors.name.message}</small>
        )}
      </div>
      <div className="field">
        <label>Código *</label>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              className={`w-full ${errors.code ? "p-invalid" : ""}`}
              placeholder="Código único (ej. A, C, PRIMA_ESP)"
            />
          )}
        />
        {errors.code && (
          <small className="p-error">{errors.code.message}</small>
        )}
      </div>
      <div className="field">
        <label>Tipo *</label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Dropdown
              {...field}
              options={CONCEPT_TYPES}
              className={`w-full ${errors.type ? "p-invalid" : ""}`}
              placeholder="Seleccionar tipo"
            />
          )}
        />
        {errors.type && (
          <small className="p-error">{errors.type.message}</small>
        )}
      </div>
      <div className="field">
        <label>Descripción</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <InputTextarea
              {...field}
              className="w-full"
              rows={3}
              placeholder="Descripción opcional"
            />
          )}
        />
      </div>
      <div className="field-checkbox">
        <Controller
          name="isTaxable"
          control={control}
          render={({ field }) => (
            <Checkbox
              inputId="isTaxable"
              checked={field.value}
              onChange={(e) => field.onChange(e.checked)}
            />
          )}
        />
        <label htmlFor="isTaxable" className="ml-2">
          ¿Gravable (ISLR / IVSS)?
        </label>
      </div>

      {/* ─── Tipo de Contrato (scope del concepto) ─── */}
      <div className="field">
        <label>Tipo de contrato (alcance)</label>
        <small className="block text-color-secondary mb-1">
          "Universal" aplica a todos los empleados. Si seleccionas un tipo
          específico, el concepto solo se calculará para empleados con ese tipo
          de contrato.
        </small>
        <Controller
          name="contractTypeId"
          control={control}
          render={({ field }) => (
            <Dropdown
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={contractTypeOptions}
              className="w-full"
              placeholder="Universal (todos los empleados)"
              showClear
            />
          )}
        />
      </div>

      {/* ─── Sección fórmula ─── */}
      <div className="field">
        <div className="flex align-items-center justify-content-between mb-1">
          <label>Orden de ejecución</label>
          <small className="text-color-secondary">
            0 = primero. Los conceptos sin fórmula ignoran este campo.
          </small>
        </div>
        <Controller
          name="executionOrder"
          control={control}
          render={({ field }) => (
            <InputNumber
              value={field.value}
              onValueChange={(e) => field.onChange(e.value ?? 0)}
              min={0}
              className="w-full"
            />
          )}
        />
      </div>

      <div className="field">
        <div className="flex align-items-center justify-content-between mb-1">
          <label>Fórmula (opcional)</label>
          <span
            className="text-primary cursor-pointer text-sm"
            onClick={() => setShowHelp((v) => !v)}
          >
            {showHelp ? "Ocultar ayuda" : "Ver variables disponibles"}
          </span>
        </div>
        {showHelp && (
          <Panel className="mb-2" style={{ fontSize: "0.85rem" }}>
            {varsLoading && <p>Cargando variables...</p>}
            {availableVars && (
              <>
                <p className="mt-0 mb-2 font-bold">Variables del sistema</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableVars.systemVars.map((v) => (
                    <Tag
                      key={v.name}
                      value={v.name}
                      title={v.description}
                      severity="info"
                      className="cursor-pointer"
                      onClick={() => {
                        const textarea = document.querySelector('[name="formula"]') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const formula = watch("formula") || "";
                          const newFormula = formula.substring(0, start) + v.name + formula.substring(end);
                          // You'd need to update the form value here
                        }
                      }}
                    />
                  ))}
                </div>

                <p className="mb-1 font-bold">Variables de asistencia</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableVars.attendanceVars.map((v) => (
                    <Tag
                      key={v.name}
                      value={v.name}
                      title={v.description}
                      severity="warning"
                    />
                  ))}
                </div>

                <p className="mb-1 font-bold">Códigos de conceptos (para referenciar)</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableVars.conceptCodes.map((code) => (
                    <Tag
                      key={code}
                      value={code}
                      severity="success"
                      className="font-monospace"
                    />
                  ))}
                </div>

                <p className="mb-1 font-bold">Variables de entrada (inputVars)</p>
                <p className="mt-0 text-color-secondary mb-2">
                  Declara abajo los nombres de las variables que el usuario
                  ingresará por empleado al procesar.
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableVars.inputVars.length > 0 ? (
                    availableVars.inputVars.map((v) => (
                      <Tag key={v} value={v} severity="info" />
                    ))
                  ) : (
                    <small className="text-color-secondary">
                      No hay variables de entrada definidas aún
                    </small>
                  )}
                </div>

                <p className="mb-0 font-bold">Ejemplo CCP 5×2</p>
                <code className="block mt-1 p-2 border-round surface-100">
                  (salario_basico / 8) * 1.52 * horas_viaje
                </code>
              </>
            )}
          </Panel>
        )}
        <Controller
          name="formula"
          control={control}
          render={({ field }) => (
            <FormulaEditor
              value={field.value || ""}
              onChange={(val) => {
                field.onChange(val);
                setValidationResult(null);
              }}
              onValidate={handleValidate}
              isValidating={validating}
              className={errors.formula ? "p-invalid" : ""}
            />
          )}
        />
        {errors.formula && (
          <small className="p-error">{errors.formula.message}</small>
        )}
        {validationResult !== null && (
          <Message
            className="mt-2 w-full"
            severity={validationResult.valid ? "success" : "error"}
            text={
              validationResult.valid
                ? "Fórmula válida — sintaxis correcta."
                : `Error: ${validationResult.error}`
            }
          />
        )}
      </div>

      <div className="field">
        <label>Variables de entrada (inputVars)</label>
        <small className="block text-color-secondary mb-1">
          Nombres de variables que el usuario ingresará por empleado al procesar
          la nómina. Presiona Enter para agregar.
        </small>
        <Controller
          name="inputVars"
          control={control}
          render={({ field }) => (
            <Chips
              value={field.value ?? []}
              onChange={(e) => field.onChange(e.value ?? [])}
              className="w-full"
              placeholder="ej. horas_viaje (Enter)"
              separator=","
            />
          )}
        />
      </div>

      <FormActionButtons
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitLabel={concept?.id ? "Actualizar" : "Crear"}
      />
    </form>
  );
}
