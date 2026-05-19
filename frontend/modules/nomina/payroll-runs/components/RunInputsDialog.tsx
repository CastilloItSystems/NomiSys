"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { getEmployees } from "@/modules/nomina/employees/services/employee.service";
import { getSalaryConcepts } from "@/modules/nomina/salary-concepts/services/salaryConcept.service";
import { getRunInputs, upsertRunInputs } from "../services/payrollRun.service";
import { handleFormError } from "@/utils/errorHandlers";

interface Props {
  runId: string;
  visible: boolean;
  onHide: () => void;
  /** Called after saving inputs — caller can then trigger processPayrollRun */
  onSaved: () => void;
}

interface EmployeeRow {
  id: string;
  name: string;
  vars: Record<string, number | undefined>;
}

export default function RunInputsDialog({
  runId,
  visible,
  onHide,
  onSaved,
}: Props) {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [requiredVars, setRequiredVars] = useState<string[]>([]);
  const [rows, setRows] = useState<EmployeeRow[]>([]);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      setLoading(true);
      try {
        // Load active formula concepts to get required inputVars
        const conceptsResp = await getSalaryConcepts({
          limit: 200,
          isActive: true,
        });
        const vars = [
          ...new Set(
            (conceptsResp.salaryConcepts ?? conceptsResp.concepts ?? [])
              .filter((c) => c.inputVars && c.inputVars.length > 0)
              .flatMap((c) => c.inputVars!),
          ),
        ];
        setRequiredVars(vars);

        if (vars.length === 0) {
          // Nothing to fill in — no formulas with inputVars
          setRows([]);
          setLoading(false);
          return;
        }

        // Load active employees
        const empResp = await getEmployees(
          0,
          200,
          undefined,
          undefined,
          undefined,
          "ACTIVE",
        );
        const employees = empResp.data;

        // Load existing inputs
        const existingInputs = await getRunInputs(runId);
        const inputMap = Object.fromEntries(
          existingInputs.map((i) => [i.employeeId, i.vars]),
        );

        setRows(
          employees.map(
            (e: { id: string; firstName: string; lastName: string }) => ({
              id: e.id,
              name: `${e.firstName} ${e.lastName}`,
              vars: Object.fromEntries(
                vars.map((v) => [v, inputMap[e.id]?.[v] ?? undefined]),
              ),
            }),
          ),
        );
      } catch (err) {
        handleFormError(err, toast);
      } finally {
        setLoading(false);
      }
    })();
  }, [visible, runId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const entries = rows
        .filter((r) =>
          Object.values(r.vars).some((v) => v !== undefined && v !== null),
        )
        .map((r) => ({
          employeeId: r.id,
          vars: Object.fromEntries(
            Object.entries(r.vars)
              .filter(([, v]) => v !== undefined && v !== null)
              .map(([k, v]) => [k, v as number]),
          ),
        }));
      if (entries.length > 0) {
        await upsertRunInputs(runId, entries);
      }
      toast.current?.show({
        severity: "success",
        summary: "Guardado",
        detail: "Variables de entrada guardadas",
        life: 2000,
      });
      onSaved();
    } catch (err) {
      handleFormError(err, toast);
    } finally {
      setSaving(false);
    }
  };

  const updateVar = (empId: string, varName: string, value: number | null) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === empId
          ? { ...r, vars: { ...r.vars, [varName]: value ?? undefined } }
          : r,
      ),
    );
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancelar"
        severity="secondary"
        onClick={onHide}
        disabled={saving}
      />
      <Button
        label={saving ? "Guardando…" : "Guardar variables"}
        icon="pi pi-save"
        onClick={handleSave}
        loading={saving}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        header="Variables de entrada por empleado"
        style={{ width: "min(95vw, 900px)" }}
        maximizable
        footer={footer}
        modal
      >
        {loading ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner />
          </div>
        ) : requiredVars.length === 0 ? (
          <Message
            severity="info"
            text="No hay conceptos con variables de entrada requeridas. Puedes procesar la nómina directamente."
            className="w-full"
          />
        ) : (
          <>
            <p className="text-color-secondary mt-0 mb-3">
              Ingresa los valores por empleado. Los campos vacíos se tratarán
              como 0.
            </p>
            <div className="overflow-auto" style={{ maxHeight: "60vh" }}>
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem",
                        borderBottom: "2px solid var(--surface-border)",
                        position: "sticky",
                        top: 0,
                        background: "var(--surface-card)",
                        zIndex: 1,
                        minWidth: "160px",
                      }}
                    >
                      Empleado
                    </th>
                    {requiredVars.map((v) => (
                      <th
                        key={v}
                        style={{
                          textAlign: "center",
                          padding: "0.5rem",
                          borderBottom: "2px solid var(--surface-border)",
                          position: "sticky",
                          top: 0,
                          background: "var(--surface-card)",
                          zIndex: 1,
                          minWidth: "130px",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                        }}
                      >
                        {v}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: "1px solid var(--surface-border)",
                      }}
                    >
                      <td style={{ padding: "0.4rem 0.5rem", fontWeight: 500 }}>
                        {row.name}
                      </td>
                      {requiredVars.map((v) => (
                        <td key={v} style={{ padding: "0.25rem 0.5rem" }}>
                          <InputNumber
                            value={row.vars[v] ?? null}
                            onValueChange={(e) =>
                              updateVar(row.id, v, e.value ?? null)
                            }
                            minFractionDigits={0}
                            maxFractionDigits={4}
                            min={0}
                            className="w-full"
                            inputStyle={{
                              textAlign: "right",
                              width: "100%",
                              minWidth: "100px",
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}
