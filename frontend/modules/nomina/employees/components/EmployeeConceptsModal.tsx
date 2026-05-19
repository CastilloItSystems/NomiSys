"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSalaryConcepts } from "@/modules/nomina/salary-concepts/services/salaryConcept.service";
import { getAvailableVariables } from "@/modules/nomina/salary-concepts/services/salaryConcept.service";
import {
  getEmployeeConcepts,
  upsertManyEmployeeConcepts,
} from "@/modules/nomina/employee-concepts/services/employeeConcepts.service";

// Schema for concept row
const conceptRowSchema = z.object({
  id: z.string().optional(),
  conceptId: z.string().min(1, "Seleccione un concepto"),
  manualAmount: z.number().min(0, "Debe ser ≥ 0").optional(),
  disabled: z.boolean().default(false),
  notes: z.string().optional(),
});

const formSchema = z.object({
  concepts: z.array(conceptRowSchema),
});

interface ConceptRow {
  id?: string;
  conceptId: string;
  manualAmount?: number;
  disabled: boolean;
  notes?: string;
}

interface EmployeeConceptsModalProps {
  visible: boolean;
  onHide: () => void;
  employeeId: string;
  employeeName: string;
  contractTypeId?: string | null;
  onSave?: () => void;
}

interface ConceptOption {
  label: string;
  value: string;
  code: string;
  type: string;
  isTaxable: boolean;
}

export default function EmployeeConceptsModal({
  visible,
  onHide,
  employeeId,
  employeeName,
  contractTypeId,
  onSave,
}: EmployeeConceptsModalProps) {
  const [saving, setSaving] = useState(false);
  const [conceptOptions, setConceptOptions] = useState<ConceptOption[]>([]);
  const [loading, setLoading] = useState(false);
  const toastRef: any = useState(null);

  const { control, handleSubmit, reset, watch } = useForm<{
    concepts: ConceptRow[];
  }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concepts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "concepts",
  });

  // Load available concepts (universal + contract-specific) and employee's current concepts
  useEffect(() => {
    if (!visible) return;
    const loadData = async () => {
      try {
        setLoading(true);
        // Load available concepts
        const data = await getSalaryConcepts({
          isActive: "true",
          orderBy: "executionOrder",
          order: "asc",
        });
        const options: ConceptOption[] = (data?.salaryConcepts || [])
          .filter(
            (c: any) =>
              c.contractTypeId === null || c.contractTypeId === contractTypeId
          )
          .map((c: any) => ({
            label: `${c.code} - ${c.name}`,
            value: c.id,
            code: c.code,
            type: c.type,
            isTaxable: c.isTaxable,
          }));
        setConceptOptions(options);

        // Load employee's current concepts
        const empConcepts = await getEmployeeConcepts(employeeId);
        if (empConcepts && empConcepts.length > 0) {
          const formatted = empConcepts.map((ec: any) => ({
            id: ec.id,
            conceptId: ec.conceptId,
            manualAmount: ec.manualAmount ?? undefined,
            disabled: ec.disabled,
            notes: ec.notes || undefined,
          }));
          reset({ concepts: formatted });
        }
      } catch (error) {
        console.error("Error loading concepts:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [visible, contractTypeId, employeeId]);

  const onSubmit = async (data: { concepts: ConceptRow[] }) => {
    try {
      setSaving(true);
      // Transform form data to API format
      const conceptsToSave = data.concepts
        .filter((c) => c.conceptId) // Skip empty rows
        .map((c) => ({
          conceptId: c.conceptId,
          manualAmount: c.manualAmount || undefined,
          disabled: c.disabled,
          notes: c.notes || undefined,
        }));
      
      if (conceptsToSave.length > 0) {
        await upsertManyEmployeeConcepts({
          employeeId,
          concepts: conceptsToSave,
        });
      }
      
      toastRef.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Conceptos guardados",
        life: 3000,
      });
      if (onSave) onSave();
      onHide();
    } catch (error: any) {
      console.error("Error saving concepts:", error);
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: error?.message || "Error al guardar conceptos",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const getTypeSeverity = (type: string) => {
    switch (type) {
      case "Ingreso":
        return "success";
      case "Deducción":
        return "danger";
      case "Aporte Patronal":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <>
      <Toast ref={toastRef} />
      <Dialog
        header={`Conceptos de Nómina - ${employeeName}`}
        visible={visible}
        onHide={onHide}
        style={{ width: "90vw", maxWidth: "1200px" }}
        modal
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cerrar"
              icon="pi pi-times"
              onClick={onHide}
              className="p-button-secondary"
            />
            <Button
              label="Guardar"
              icon="pi pi-check"
              onClick={handleSubmit(onSubmit)}
              loading={saving}
            />
          </div>
        }
      >
        <div className="mb-3">
          <small className="text-600">
            Conceptos universales y del contrato asignado. Use "Agregar concepto" para
            añadir conceptos adicionales con montos manuales.
          </small>
        </div>

        {/* Concept rows */}
        <div className="flex flex-column gap-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex align-items-start gap-2 p-2 border-1 surface-border border-round"
              style={{ backgroundColor: index % 2 === 0 ? "transparent" : "#f8f9fa" }}
            >
              {/* Concept selector */}
              <div className="flex-1">
                <Controller
                  name={`concepts.${index}.conceptId`}
                  control={control}
                  render={({ field: f, fieldState: { error } }) => (
                    <>
                      <Dropdown
                        value={f.value}
                        onChange={(e) => f.onChange(e.value)}
                        options={conceptOptions}
                        placeholder="Seleccionar concepto..."
                        className={`w-full ${error ? "p-invalid" : ""}`}
                        showClear
                      />
                      {error && (
                        <small className="p-error">{error.message}</small>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Concept type badge */}
              <div style={{ minWidth: "100px" }}>
                {watch(`concepts.${index}.conceptId`) && (
                  <>
                    {(() => {
                      const selected = conceptOptions.find(
                        (o) => o.value === watch(`concepts.${index}.conceptId`)
                      );
                      return selected ? (
                        <Tag
                          value={selected.type}
                          severity={getTypeSeverity(selected.type)}
                          className="mt-2"
                        />
                      ) : null;
                    })()}
                  </>
                )}
              </div>

              {/* Manual amount */}
              <div style={{ minWidth: "150px" }}>
                <Controller
                  name={`concepts.${index}.manualAmount`}
                  control={control}
                  render={({ field: f }) => (
                    <InputNumber
                      value={f.value}
                      onValueChange={(e) => f.onChange(e.value)}
                      mode="currency"
                      currency="USD"
                      locale="en-US"
                      placeholder="Monto manual"
                      className="w-full"
                      min={0}
                    />
                  )}
                />
              </div>

              {/* Disabled checkbox */}
              <div className="flex align-items-center pt-2">
                <Controller
                  name={`concepts.${index}.disabled`}
                  control={control}
                  render={({ field: f }) => (
                    <label className="flex align-items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={f.value}
                        onChange={(e) => f.onChange(e.target.checked)}
                        className="cursor-pointer"
                      />
                      <span className="text-sm">Excluir</span>
                    </label>
                  )}
                />
              </div>

              {/* Remove button */}
              <div>
                <Button
                  icon="pi pi-trash"
                  onClick={() => remove(index)}
                  className="p-button-danger p-button-text p-button-sm"
                  tooltip="Eliminar"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add concept button */}
        <div className="mt-3">
          <Button
            label="Agregar concepto"
            icon="pi pi-plus"
            onClick={() =>
              append({ conceptId: "", manualAmount: undefined, disabled: false })
            }
            className="p-button-outlined"
          />
        </div>

        {/* Summary */}
        {fields.length > 0 && (
          <div className="mt-3 p-3 surface-100 border-round">
            <strong>Total conceptos:</strong> {fields.length}
            <br />
            <small className="text-600">
              Los conceptos con monto manual sobrescribirán la fórmula. Los
              conceptos excluidos no se calcularán para este empleado.
            </small>
          </div>
        )}
      </Dialog>
    </>
  );
}
