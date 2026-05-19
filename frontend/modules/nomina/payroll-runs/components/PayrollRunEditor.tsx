"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Divider } from "primereact/divider";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import {
  getPayrollRun,
  getPayrollRunLines,
  getRunInputs,
  upsertRunInputs,
  processPayrollRun,
  approvePayrollRun,
} from "../services/payrollRun.service";
import { getPayrollPeriods } from "@/modules/nomina/payroll-periods/services/payrollPeriod.service";
import { getEmployees } from "@/modules/nomina/employees/services/employee.service";
import { getSalaryConcepts } from "@/modules/nomina/salary-concepts/services/salaryConcept.service";
import type {
  PayrollRun,
  PayrollRunLine,
} from "../interfaces/payrollRun.interface";
import type { Employee } from "@/modules/nomina/employees/interfaces/employee.interface";
import type { SalaryConcept } from "@/modules/nomina/salary-concepts/interfaces/salaryConcept.interface";
import type { PayrollPeriod } from "@/modules/nomina/payroll-periods/interfaces/payrollPeriod.interface";

interface Props {
  runId: string;
}

const STATUS_SEVERITY: Record<string, any> = {
  Borrador: "secondary",
  Procesando: "warning",
  Procesado: "info",
  Aprobado: "success",
  Pagado: "success",
  Anulado: "danger",
};

const fmt = (v: number | string) =>
  "$" +
  Number(v).toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function PayrollRunEditor({ runId }: Props) {
  const router = useRouter();
  const toast = useRef<Toast>(null);

  // ── Remote data ──────────────────────────────────────────────────────────
  const { data: run, mutate: mutateRun } = useSWR<PayrollRun>(
    ["run", runId],
    () => getPayrollRun(runId),
    { revalidateOnFocus: false },
  );
  const { data: periodsData } = useSWR(
    "periods-editor",
    () => getPayrollPeriods(),
    { revalidateOnFocus: false },
  );
  const { data: employeesData } = useSWR(
    "employees-editor",
    () => getEmployees(0, 500, undefined, undefined, undefined, "ACTIVE"),
    { revalidateOnFocus: false },
  );
  const { data: conceptsData } = useSWR(
    "concepts-editor",
    () => getSalaryConcepts({ isActive: true, limit: 200 }),
    { revalidateOnFocus: false },
  );
  const { data: inputsData, mutate: mutateInputs } = useSWR(
    run ? ["run-inputs", runId] : null,
    () => getRunInputs(runId),
    { revalidateOnFocus: false },
  );
  const { data: linesData, mutate: mutateLines } = useSWR(
    run?.status !== "Borrador" ? ["run-lines", runId] : null,
    () => getPayrollRunLines(runId),
    { revalidateOnFocus: false },
  );

  // ── Local state ───────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, Record<string, number>>>(
    {},
  );
  const [selectedExtraConceptCode, setSelectedExtraConceptCode] = useState<
    string | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showConceptsModal, setShowConceptsModal] = useState(false);

  // ── Derived maps ──────────────────────────────────────────────────────────
  const periods: PayrollPeriod[] = periodsData?.payrollPeriods ?? [];
  const period = periods.find((p) => p.id === run?.periodId);
  const allEmployees: Employee[] = (employeesData as any)?.data ?? [];
  const allConcepts: SalaryConcept[] = conceptsData?.salaryConcepts ?? [];
  const lines: PayrollRunLine[] = Array.isArray(linesData) ? linesData : [];

  const lineByEmp = useMemo(
    () => Object.fromEntries(lines.map((l) => [l.employeeId, l])),
    [lines],
  );
  const savedInputs: Record<string, Record<string, number>> = useMemo(
    () =>
      Object.fromEntries(
        (inputsData ?? []).map((i: any) => [i.employeeId, i.vars ?? {}]),
      ),
    [inputsData],
  );

  // Filtered employees shown in left panel
  const employees = useMemo(
    () =>
      allEmployees.filter((e) => {
        const name =
          `${e.firstName} ${e.lastName} ${e.employeeCode}`.toLowerCase();
        return name.includes(search.toLowerCase());
      }),
    [allEmployees, search],
  );

  const emp = employees[selectedIdx] ?? null;

  // Concepts that apply to this employee
  const empConcepts = useMemo(() => {
    if (!emp) return [];
    return allConcepts.filter(
      (c) =>
        c.contractTypeId === null ||
        c.contractTypeId === (emp as any).contractTypeId,
    );
  }, [emp, allConcepts]);

  const worksheetConcepts = useMemo(() => {
    if (!emp) return [];
    const base = [...empConcepts];
    const currentVars = drafts[emp.id] ?? savedInputs[emp.id] ?? {};
    const manualCodes = Object.keys(currentVars)
      .filter((k) => k.startsWith("manual_"))
      .map((k) => k.replace("manual_", ""));

    for (const code of manualCodes) {
      if (!base.some((c) => c.code === code)) {
        const found = allConcepts.find((c) => c.code === code);
        if (found) base.push(found);
      }
    }

    return base;
  }, [emp?.id, empConcepts, allConcepts, drafts, savedInputs]);

  // All inputVars required by this employee's concepts
  const requiredVars = useMemo(
    () => [...new Set(empConcepts.flatMap((c) => c.inputVars ?? []))],
    [empConcepts],
  );

  // Current draft values for this employee (or saved, or 0)
  const empVars: Record<string, number> = useMemo(() => {
    if (!emp) return {};
    return drafts[emp.id] ?? savedInputs[emp.id] ?? {};
  }, [emp, drafts, savedInputs]);

  // Initialise draft from saved when employee changes
  useEffect(() => {
    if (!emp) return;
    if (!drafts[emp.id] && savedInputs[emp.id]) {
      setDrafts((prev) => ({ ...prev, [emp.id]: { ...savedInputs[emp.id] } }));
    }
  }, [emp?.id, savedInputs]);

  const hasDraft = emp
    ? JSON.stringify(empVars) !== JSON.stringify(savedInputs[emp.id] ?? {})
    : false;

  const lineConceptsByCode = useMemo(() => {
    const current = emp ? lineByEmp[emp.id] : null;
    if (!current?.details?.concepts) return {};
    const map: Record<string, any> = {};
    for (const c of current.details.concepts as any[]) {
      if (c.code) map[c.code] = c;
    }
    return map;
  }, [emp?.id, lineByEmp]);

  const inferVarField = (
    concept: SalaryConcept,
    kind: "dias" | "factor" | "cantidad",
  ) => {
    const vars = concept.inputVars ?? [];
    if (kind === "dias") {
      return vars.find((v) => v.includes("dia") || v.includes("dias")) ?? null;
    }
    if (kind === "factor") {
      return (
        vars.find(
          (v) =>
            v.includes("factor") ||
            v.includes("porcentaje") ||
            v.includes("tasa"),
        ) ?? null
      );
    }
    return (
      vars.find((v) => {
        const isDias = v.includes("dia") || v.includes("dias");
        const isFactor =
          v.includes("factor") ||
          v.includes("porcentaje") ||
          v.includes("tasa");
        return !isDias && !isFactor;
      }) ??
      vars[0] ??
      null
    );
  };

  const conceptRows = useMemo(() => {
    return worksheetConcepts.map((c) => {
      const diasField = inferVarField(c, "dias");
      const factorField = inferVarField(c, "factor");
      const cantidadField = inferVarField(c, "cantidad");
      const diasKey = `${c.code}_dias`;
      const factorKey = `${c.code}_factor`;
      const cantidadKey = `${c.code}_cantidad`;
      const processedAmount = lineConceptsByCode[c.code]?.amount;
      const amount = Number(processedAmount ?? 0);
      const isDed = c.type === "Deducción";
      const isDisabled = Number(empVars[`disabled_${c.code}`] ?? 0) === 1;
      return {
        id: c.id,
        code: c.code,
        name: c.name,
        type: c.type,
        isTaxable: c.isTaxable,
        isDisabled,
        diasField,
        factorField,
        cantidadField,
        diasKey,
        factorKey,
        cantidadKey,
        dias: Number(
          empVars[diasKey] ?? (diasField ? empVars[diasField] : 0) ?? 0,
        ),
        factor: Number(
          empVars[factorKey] ?? (factorField ? empVars[factorField] : 0) ?? 0,
        ),
        cantidad: Number(
          empVars[cantidadKey] ??
            (cantidadField ? empVars[cantidadField] : 0) ??
            0,
        ),
        manualField: `manual_${c.code}`,
        manualAmount: Number(empVars[`manual_${c.code}`] ?? 0),
        amount,
        devengo: isDed || isDisabled ? 0 : amount,
        deduccion: isDed && !isDisabled ? Math.abs(amount) : 0,
      };
    });
  }, [worksheetConcepts, empVars, lineConceptsByCode]);

  const worksheetTotals = useMemo(() => {
    const devengo = conceptRows.reduce(
      (sum, r) => sum + Number(r.devengo ?? 0),
      0,
    );
    const deduccion = conceptRows.reduce(
      (sum, r) => sum + Number(r.deduccion ?? 0),
      0,
    );
    return { devengo, deduccion, neto: devengo - deduccion };
  }, [conceptRows]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const setVar = (varName: string, value: number) => {
    if (!emp) return;
    setDrafts((prev) => ({
      ...prev,
      [emp.id]: {
        ...(prev[emp.id] ?? savedInputs[emp.id] ?? {}),
        [varName]: value,
      },
    }));
  };

  const setConceptField = (
    row: any,
    kind: "dias" | "factor" | "cantidad",
    value: number,
  ) => {
    if (kind === "dias") {
      setVar(row.diasKey, value);
      if (row.diasField && row.diasField !== row.diasKey)
        setVar(row.diasField, value);
      return;
    }
    if (kind === "factor") {
      setVar(row.factorKey, value);
      if (row.factorField && row.factorField !== row.factorKey)
        setVar(row.factorField, value);
      return;
    }
    setVar(row.cantidadKey, value);
    if (row.cantidadField && row.cantidadField !== row.cantidadKey)
      setVar(row.cantidadField, value);
  };

  const saveVars = async () => {
    if (!emp) return;
    try {
      setSaving(true);
      await upsertRunInputs(runId, [{ employeeId: emp.id, vars: empVars }]);
      await mutateInputs();
      toast.current?.show({
        severity: "success",
        summary: "Guardado",
        detail: `Variables de ${emp.firstName} guardadas`,
        life: 2000,
      });
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron guardar las variables",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProcess = () => {
    confirmDialog({
      header: "Procesar Nómina",
      message:
        "¿Seguro que deseas procesar esta nómina? Se calcularán los pagos para todos los empleados.",
      icon: "pi pi-play-circle",
      acceptLabel: "Sí, procesar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          setProcessing(true);
          await processPayrollRun(runId);
          await Promise.all([mutateRun(), mutateLines()]);
          toast.current?.show({
            severity: "success",
            summary: "Procesado",
            detail: "Nómina procesada correctamente",
            life: 3000,
          });
        } catch (err: any) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: err?.response?.data?.message ?? "Error al procesar",
            life: 4000,
          });
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const handleApprove = async () => {
    try {
      await approvePayrollRun(runId);
      await mutateRun();
      toast.current?.show({
        severity: "success",
        summary: "Aprobado",
        detail: "Nómina aprobada",
        life: 3000,
      });
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Error al aprobar",
        life: 3000,
      });
    }
  };

  const navigate = (delta: number) => {
    const next = selectedIdx + delta;
    if (next >= 0 && next < employees.length) setSelectedIdx(next);
  };

  const addManualConceptToEmployee = () => {
    if (!emp || !selectedExtraConceptCode) return;
    setVar(`manual_${selectedExtraConceptCode}`, 0);
    setSelectedExtraConceptCode(null);
  };

  if (!run) {
    return (
      <div
        className="flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <ProgressSpinner />
      </div>
    );
  }

  const isProcessed = !["Borrador", "Procesando"].includes(run.status);
  const canProcess = run.status === "Borrador";
  const canApprove = run.status === "Procesado";

  return (
    <div
      className="flex flex-column gap-0"
      style={{ height: "calc(100vh - 120px)" }}
    >
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="card mb-0 py-3 px-4 flex align-items-center gap-3 flex-wrap border-bottom-1 surface-border">
        <Button
          icon="pi pi-arrow-left"
          text
          onClick={() => router.push("/empresa/nomina/calculo")}
          tooltip="Volver a la lista"
        />
        <div className="flex-1">
          <div className="flex align-items-center gap-2 flex-wrap">
            <span className="font-semibold text-lg">
              {period?.name ?? run.periodId}
            </span>
            <Tag value={run.runType} severity="info" />
            <Tag value={run.status} severity={STATUS_SEVERITY[run.status]} />
          </div>
          {period && (
            <small className="text-500">
              {new Date(period.startDate).toLocaleDateString("es-VE")} –{" "}
              {new Date(period.endDate).toLocaleDateString("es-VE")}
            </small>
          )}
        </div>

        {/* Totals (if processed) */}
        {isProcessed && (
          <div className="flex gap-4 text-sm">
            <span>
              <span className="text-500">Empleados: </span>
              <strong>{run.employeeCount}</strong>
            </span>
            <span>
              <span className="text-500">Bruto: </span>
              <strong className="text-green-600">{fmt(run.totalGross)}</strong>
            </span>
            <span>
              <span className="text-500">Deducciones: </span>
              <strong className="text-red-500">
                {fmt(run.totalDeductions)}
              </strong>
            </span>
            <span>
              <span className="text-500">Neto: </span>
              <strong className="text-primary">{fmt(run.totalNet)}</strong>
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {canProcess && (
            <Button
              label="Procesar Nómina"
              icon="pi pi-play"
              severity="success"
              loading={processing}
              onClick={handleProcess}
            />
          )}
          {canApprove && (
            <Button
              label="Aprobar"
              icon="pi pi-check-circle"
              severity="success"
              onClick={handleApprove}
            />
          )}
        </div>
      </div>

      {/* ── Main split ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: employee list ─────────────────────────────────────── */}
        <div
          className="flex flex-column border-right-1 surface-border"
          style={{ width: "280px", minWidth: "240px" }}
        >
          <div className="p-3 border-bottom-1 surface-border">
            <span className="p-input-icon-left w-full">
              <i className="pi pi-search" />
              <InputText
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIdx(0);
                }}
                placeholder="Buscar empleado..."
                className="w-full"
                style={{ paddingLeft: "2rem" }}
              />
            </span>
            <small className="text-500 mt-1 block">
              {employees.length} empleados
            </small>
          </div>

          <div className="overflow-y-auto flex-1">
            {employees.map((e, idx) => {
              const line = lineByEmp[e.id];
              const hasInputs = !!(
                savedInputs[e.id] && Object.keys(savedInputs[e.id]).length > 0
              );
              const isSelected = idx === selectedIdx;
              return (
                <div
                  key={e.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={`p-3 cursor-pointer border-bottom-1 surface-border flex align-items-start gap-2 ${
                    isSelected ? "surface-200" : "hover:surface-100"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                      {e.firstName} {e.lastName}
                    </div>
                    <small className="text-500 block">{e.employeeCode}</small>
                    {(e as any).contractType && (
                      <small className="text-400 block text-overflow-ellipsis overflow-hidden white-space-nowrap">
                        {(e as any).contractType}
                      </small>
                    )}
                  </div>
                  <div className="flex flex-column align-items-end gap-1">
                    {line && (
                      <i
                        className="pi pi-check-circle text-green-500"
                        title="Procesado"
                      />
                    )}
                    {hasInputs && !line && (
                      <i
                        className="pi pi-save text-blue-500"
                        title="Variables guardadas"
                      />
                    )}
                    {line && (
                      <small className="text-primary font-bold">
                        {fmt(line.netSalary)}
                      </small>
                    )}
                  </div>
                </div>
              );
            })}
            {employees.length === 0 && (
              <div className="p-4 text-center text-500">
                No hay empleados activos
              </div>
            )}
          </div>
        </div>

        {/* ── Right: employee detail ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4">
          {!emp ? (
            <div className="flex justify-content-center align-items-center h-full text-500">
              Selecciona un empleado
            </div>
          ) : (
            <div className="flex flex-column gap-4">
              {/* Employee header + navigation */}
              <div className="flex align-items-center gap-3">
                <Button
                  icon="pi pi-chevron-left"
                  text
                  rounded
                  onClick={() => navigate(-1)}
                  disabled={selectedIdx === 0}
                />
                <div className="card flex-1 py-3 px-4 m-0">
                  <div className="flex align-items-center justify-content-between flex-wrap gap-3">
                    <div>
                      <h4 className="m-0">
                        {emp.firstName} {emp.middleName ?? ""} {emp.lastName}{" "}
                        {(emp as any).secondLastName ?? ""}
                      </h4>
                      <div className="flex gap-3 mt-1 flex-wrap">
                        <small className="text-500">
                          Código: <strong>{emp.employeeCode}</strong>
                        </small>
                        <small className="text-500">
                          C.I.:{" "}
                          <strong>
                            {emp.documentType}-{emp.documentNumber}
                          </strong>
                        </small>
                        {(emp as any).contractType && (
                          <small className="text-500">
                            Contrato:{" "}
                            <strong>{(emp as any).contractType}</strong>
                          </small>
                        )}
                        {(emp as any).currentSalary && (
                          <small className="text-500">
                            Salario:{" "}
                            <strong>
                              {fmt((emp as any).currentSalary)}{" "}
                              {(emp as any).salaryType ?? ""}
                            </strong>
                          </small>
                        )}
                      </div>
                    </div>
                    <small className="text-400">
                      {selectedIdx + 1} / {employees.length}
                    </small>
                  </div>
                </div>
                <Button
                  icon="pi pi-chevron-right"
                  text
                  rounded
                  onClick={() => navigate(1)}
                  disabled={selectedIdx >= employees.length - 1}
                />
              </div>

              {/* ── Result card (if processed) ── */}
              {lineByEmp[emp.id] &&
                (() => {
                  const line = lineByEmp[emp.id];
                  const ingresos = (line.details?.concepts ?? []).filter(
                    (c: any) => c.type !== "Deducción",
                  );
                  const deducciones = (line.details?.concepts ?? []).filter(
                    (c: any) => c.type === "Deducción",
                  );
                  return (
                    <div className="card m-0">
                      <h5 className="m-0 mb-3">Resultado del Cálculo</h5>
                      <div className="grid">
                        <div className="col-12 md:col-4">
                          <div className="text-500 text-sm mb-1">Ingresos</div>
                          {ingresos.map((c: any, i: number) => (
                            <div
                              key={i}
                              className="flex justify-content-between py-1 border-bottom-1 surface-border"
                            >
                              <span className="text-sm">{c.name}</span>
                              <span className="text-sm text-green-600 font-medium">
                                {fmt(c.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="col-12 md:col-4">
                          <div className="text-500 text-sm mb-1">
                            Deducciones
                          </div>
                          {deducciones.length === 0 && (
                            <small className="text-400">—</small>
                          )}
                          {deducciones.map((c: any, i: number) => (
                            <div
                              key={i}
                              className="flex justify-content-between py-1 border-bottom-1 surface-border"
                            >
                              <span className="text-sm">{c.name}</span>
                              <span className="text-sm text-red-500">
                                -{fmt(c.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="col-12 md:col-4">
                          <div className="surface-100 border-round p-3 text-center">
                            <div className="text-500 text-sm">Total Bruto</div>
                            <div className="text-green-600 font-bold text-lg">
                              {fmt(line.grossSalary)}
                            </div>
                            <div className="text-500 text-sm mt-2">
                              Deducciones
                            </div>
                            <div className="text-red-500 font-medium">
                              -{fmt(line.totalDeductions)}
                            </div>
                            <Divider className="my-2" />
                            <div className="text-500 text-sm">Neto a Pagar</div>
                            <div className="text-primary font-bold text-2xl">
                              {fmt(line.netSalary)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {/* ── Input variables ── */}
              {requiredVars.length > 0 && (
                <div className="card m-0">
                  <div className="flex align-items-center justify-content-between mb-3">
                    <h5 className="m-0">Variables de Entrada</h5>
                    {hasDraft && (
                      <Button
                        label="Guardar"
                        icon="pi pi-save"
                        size="small"
                        loading={saving}
                        onClick={saveVars}
                      />
                    )}
                  </div>
                  <div className="grid">
                    {requiredVars.map((varName) => (
                      <div
                        key={varName}
                        className="col-12 sm:col-6 md:col-4 field"
                      >
                        <label className="font-medium text-sm">
                          {varName.replace(/_/g, " ")}
                        </label>
                        <InputNumber
                          value={empVars[varName] ?? 0}
                          onValueChange={(e) => setVar(varName, e.value ?? 0)}
                          minFractionDigits={0}
                          maxFractionDigits={4}
                          className="w-full mt-1"
                          mode="decimal"
                          locale="es-VE"
                          disabled={
                            run.status === "Pagado" || run.status === "Anulado"
                          }
                        />
                      </div>
                    ))}
                  </div>
                  {hasDraft && (
                    <small className="text-orange-500">
                      <i className="pi pi-exclamation-triangle mr-1" />
                      Tienes cambios sin guardar
                    </small>
                  )}
                </div>
              )}

              {/* ── Applicable concepts (Modal) ── */}
              <div className="card m-0">
                <div className="flex align-items-center justify-content-between mb-3">
                  <h5 className="m-0">
                    Hoja de Conceptos del Empleado
                    <small className="text-500 font-normal ml-2">
                      ({empConcepts.length} conceptos — {" "}
                      {(emp as any).contractTypeId
                        ? "Contrato específico + universales"
                        : "Solo universales"}
                      )
                    </small>
                  </h5>
                  <Button
                    label="Abrir Hoja de Conceptos"
                    icon="pi pi-external-link"
                    onClick={() => setShowConceptsModal(true)}
                  />
                </div>
                <small className="text-500">
                  Haz clic en el botón para ver y editar la hoja de conceptos del empleado.
                </small>
              </div>

              <Dialog
                header={`Hoja de Conceptos - ${emp?.firstName} ${emp?.lastName}`}
                visible={showConceptsModal}
                onHide={() => setShowConceptsModal(false)}
                style={{ width: '90vw', maxWidth: '1200px' }}
                breakpoints={{ '960px': '95vw' }}
                maximizable
                dismissableMask
                className="p-fluid"
              >
                <div className="flex flex-column gap-3">
                  {empConcepts.length === 0 && (
                    <div className="text-500 text-sm">
                      No hay conceptos configurados para este tipo de contrato.
                      Puedes agregar conceptos manuales aquí o configurar el
                      contrato en
                      <strong> Nómina → Conceptos Salariales</strong>.
                    </div>
                  )}

                  <div className="flex gap-2 align-items-end flex-wrap">
                    <div style={{ minWidth: "340px" }}>
                      <label className="text-sm text-600 block mb-1">
                        Agregar concepto adicional
                      </label>
                      <Dropdown
                        value={selectedExtraConceptCode}
                        onChange={(e) => setSelectedExtraConceptCode(e.value)}
                        options={allConcepts
                          .filter(
                            (c) =>
                              !worksheetConcepts.some((w) => w.code === c.code),
                          )
                          .map((c) => ({
                            label: `${c.code} - ${c.name}`,
                            value: c.code,
                          }))}
                        placeholder="Selecciona un concepto"
                        className="w-full"
                        filter
                        showClear
                      />
                    </div>
                    <Button
                      label="Agregar"
                      icon="pi pi-plus"
                      onClick={addManualConceptToEmployee}
                      disabled={!selectedExtraConceptCode}
                    />
                  </div>

                  <DataTable
                    value={conceptRows}
                    dataKey="id"
                    size="small"
                    scrollable
                    rows={25}
                    stripedRows
                    showGridlines
                    className="p-datatable-sm"
                  >
                    <Column
                      header="Incluir"
                      body={(row) => (
                        <Checkbox
                          checked={!row.isDisabled}
                          onChange={(e) =>
                            setVar(`disabled_${row.code}`, e.checked ? 0 : 1)
                          }
                          disabled={
                            run.status === "Pagado" || run.status === "Anulado"
                          }
                        />
                      )}
                      style={{ width: "90px" }}
                    />
                    <Column
                      field="code"
                      header="Código"
                      style={{ minWidth: "110px" }}
                    />
                    <Column
                      field="name"
                      header="Concepto"
                      style={{ minWidth: "260px" }}
                      body={(row) => (
                        <div>
                          <div className="font-medium">{row.name}</div>
                          <small className="text-500">{row.type}</small>
                        </div>
                      )}
                    />
                    <Column
                      header="Días"
                      style={{ minWidth: "120px" }}
                      body={(row) => (
                        <InputNumber
                          value={row.dias}
                          onValueChange={(e) =>
                            setConceptField(row, "dias", e.value ?? 0)
                          }
                          maxFractionDigits={2}
                          className="w-full"
                          disabled={
                            row.isDisabled ||
                            run.status === "Pagado" ||
                            run.status === "Anulado"
                          }
                        />
                      )}
                    />
                    <Column
                      header="Factor"
                      style={{ minWidth: "120px" }}
                      body={(row) => (
                        <InputNumber
                          value={row.factor}
                          onValueChange={(e) =>
                            setConceptField(row, "factor", e.value ?? 0)
                          }
                          minFractionDigits={2}
                          maxFractionDigits={4}
                          className="w-full"
                          disabled={
                            row.isDisabled ||
                            run.status === "Pagado" ||
                            run.status === "Anulado"
                          }
                        />
                      )}
                    />
                    <Column
                      header="Cantidad"
                      style={{ minWidth: "130px" }}
                      body={(row) => (
                        <InputNumber
                          value={row.cantidad}
                          onValueChange={(e) =>
                            setConceptField(row, "cantidad", e.value ?? 0)
                          }
                          maxFractionDigits={4}
                          className="w-full"
                          disabled={
                            row.isDisabled ||
                            run.status === "Pagado" ||
                            run.status === "Anulado"
                          }
                        />
                      )}
                    />
                    <Column
                      header="Importe Manual"
                      style={{ minWidth: "150px" }}
                      body={(row) => (
                        <InputNumber
                          value={row.manualAmount}
                          onValueChange={(e) =>
                            setVar(row.manualField, e.value ?? 0)
                          }
                          minFractionDigits={2}
                          maxFractionDigits={2}
                          className="w-full"
                          disabled={
                            row.isDisabled ||
                            run.status === "Pagado" ||
                            run.status === "Anulado"
                          }
                        />
                      )}
                    />
                    <Column
                      header="Importe"
                      body={(row) =>
                        row.amount !== 0 ? (
                          fmt(row.amount)
                        ) : (
                          <span className="text-400">Pendiente</span>
                        )
                      }
                      style={{ minWidth: "130px" }}
                    />
                    <Column
                      header="Devengo"
                      body={(row) =>
                        row.devengo > 0 ? (
                          <span className="text-green-600 font-medium">
                            {fmt(row.devengo)}
                          </span>
                        ) : (
                          <span className="text-400">—</span>
                        )
                      }
                      style={{ minWidth: "130px" }}
                    />
                    <Column
                      header="Deducción"
                      body={(row) =>
                        row.deduccion > 0 ? (
                          <span className="text-red-500">
                            {fmt(row.deduccion)}
                          </span>
                        ) : (
                          <span className="text-400">—</span>
                        )
                      }
                      style={{ minWidth: "130px" }}
                    />
                  </DataTable>

                  <div className="flex justify-content-end gap-4 p-3 surface-100 border-round">
                    <span>
                      <span className="text-500 mr-2">Total Devengo</span>
                      <strong className="text-green-600">
                        {fmt(worksheetTotals.devengo)}
                      </strong>
                    </span>
                    <span>
                      <span className="text-500 mr-2">Total Deducción</span>
                      <strong className="text-red-500">
                        {fmt(worksheetTotals.deduccion)}
                      </strong>
                    </span>
                    <span>
                      <span className="text-500 mr-2">Neto Estimado</span>
                      <strong className="text-primary">
                        {fmt(worksheetTotals.neto)}
                      </strong>
                    </span>
                  </div>

                  <small className="text-500">
                    Nota: los importes se muestran completos después de procesar
                    la nómina. Antes de procesar, usa esta hoja para cargar
                    variables (días, factor, cantidad) y excluir conceptos por
                    empleado.
                  </small>
                </div>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
