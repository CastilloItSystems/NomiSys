"use client";

import { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Tag } from "primereact/tag";
import { Card } from "primereact/card";
import { useSocialBenefitsData } from "@/modules/nomina/social-benefits/hooks/useSocialBenefitsData";
import { accrueQuarter } from "@/modules/nomina/social-benefits/services/socialBenefit.service";
import { handleFormError } from "@/utils/errorHandlers";
import { AccrueQuarterResponse } from "@/modules/nomina/social-benefits/interfaces/socialBenefit.interface";

export default function PrestacionesSocialesPage() {
  const toast = useRef<Toast>(null);
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [filterQuarter, setFilterQuarter] = useState<number | null>(null);

  const { benefits, total, loading, mutate } = useSocialBenefitsData(
    undefined,
    filterYear ?? undefined,
    filterQuarter ?? undefined,
  );

  const [accrueDialog, setAccrueDialog] = useState(false);
  const [accrueYear, setAccrueYear] = useState<number>(currentYear);
  const [accrueQuarterVal, setAccrueQuarterVal] =
    useState<number>(currentQuarter);
  const [accruing, setAccruing] = useState(false);
  const [accrueResult, setAccrueResult] =
    useState<AccrueQuarterResponse | null>(null);
  const [resultDialog, setResultDialog] = useState(false);

  const handleAccrue = async () => {
    try {
      setAccruing(true);
      const result = await accrueQuarter({
        year: accrueYear,
        quarter: accrueQuarterVal,
      });
      setAccrueResult(result);
      setAccrueDialog(false);
      setResultDialog(true);
      mutate();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setAccruing(false);
    }
  };

  const fmt = (v: number) =>
    v
      ? `$${Number(v).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`
      : "$0.00";

  const quarterLabel = (q: number) => `T${q}`;

  return (
    <>
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="m-0">Prestaciones Sociales</h2>
          <p className="text-600 mt-1 mb-0">
            Garantía trimestral LOTTT — 15 días de salario integral por
            trimestre
          </p>
        </div>
        <Button
          label="Acumular Trimestre"
          icon="pi pi-plus"
          onClick={() => setAccrueDialog(true)}
        />
      </div>

      {/* Info card */}
      <Card className="mb-4 surface-50">
        <div className="grid">
          <div className="col-12 md:col-4">
            <div className="text-600 text-sm mb-1">Base legal</div>
            <div className="font-medium">Art. 142 LOTTT</div>
          </div>
          <div className="col-12 md:col-4">
            <div className="text-600 text-sm mb-1">Días de garantía</div>
            <div className="font-medium">15 días mínimo por trimestre</div>
          </div>
          <div className="col-12 md:col-4">
            <div className="text-600 text-sm mb-1">Base de cálculo</div>
            <div className="font-medium">
              Salario integral (incluye alícuotas)
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-3 mb-3 flex-wrap align-items-center">
        <div className="flex align-items-center gap-2">
          <label className="font-medium text-sm">Año:</label>
          <InputNumber
            value={filterYear}
            onValueChange={(e) => setFilterYear(e.value ?? null)}
            placeholder="Todos"
            min={2020}
            max={2099}
            useGrouping={false}
            inputStyle={{ width: "90px" }}
          />
        </div>
        <div className="flex align-items-center gap-2">
          <label className="font-medium text-sm">Trimestre:</label>
          <InputNumber
            value={filterQuarter}
            onValueChange={(e) => setFilterQuarter(e.value ?? null)}
            placeholder="Todos"
            min={1}
            max={4}
            useGrouping={false}
            inputStyle={{ width: "70px" }}
          />
        </div>
        <Button
          label="Limpiar"
          severity="secondary"
          outlined
          size="small"
          onClick={() => {
            setFilterYear(null);
            setFilterQuarter(null);
          }}
        />
      </div>

      {/* Table */}
      <DataTable
        value={benefits}
        loading={loading}
        paginator
        rows={20}
        dataKey="id"
        scrollable
        emptyMessage="Sin registros de prestaciones sociales"
        header={
          <div className="flex align-items-center justify-content-between">
            <span className="font-medium">Registros ({total})</span>
          </div>
        }
      >
        <Column field="employeeId" header="Empleado ID" />
        <Column
          field="period"
          header="Período"
          body={(row) => `${row.period} — ${quarterLabel(row.quarter)}`}
        />
        <Column field="year" header="Año" align="center" />
        <Column
          field="quarter"
          header="Trim."
          align="center"
          body={(row) => <Tag value={`T${row.quarter}`} severity="info" />}
        />
        <Column
          field="salarioIntegral"
          header="Sal. Integral"
          body={(row) => fmt(row.salarioIntegral)}
        />
        <Column field="diasGarantia" header="Días" align="center" />
        <Column
          field="monto"
          header="Monto Trimestral"
          body={(row) => <strong>{fmt(row.monto)}</strong>}
        />
        <Column
          field="montoAcumulado"
          header="Acumulado"
          body={(row) => fmt(row.montoAcumulado)}
        />
        <Column
          field="status"
          header="Estado"
          body={(row) => (
            <Tag
              value={row.status}
              severity={row.status === "Activo" ? "success" : "secondary"}
            />
          )}
        />
      </DataTable>

      {/* Accrue Dialog */}
      <Dialog
        header="Acumular Prestaciones del Trimestre"
        visible={accrueDialog}
        onHide={() => setAccrueDialog(false)}
        style={{ width: "420px" }}
        modal
      >
        <div className="flex flex-column gap-3 p-2">
          <p className="text-600 m-0">
            Calculará 15 días de salario integral para todos los empleados
            activos del trimestre seleccionado.
          </p>
          <div className="field">
            <label className="font-medium">Año *</label>
            <InputNumber
              value={accrueYear}
              onValueChange={(e) => setAccrueYear(e.value ?? currentYear)}
              min={2020}
              max={2099}
              useGrouping={false}
              className="w-full"
            />
          </div>
          <div className="field">
            <label className="font-medium">Trimestre (1–4) *</label>
            <InputNumber
              value={accrueQuarterVal}
              onValueChange={(e) => setAccrueQuarterVal(e.value ?? 1)}
              min={1}
              max={4}
              useGrouping={false}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 justify-content-end">
            <Button
              label="Cancelar"
              severity="secondary"
              outlined
              onClick={() => setAccrueDialog(false)}
            />
            <Button
              label="Acumular"
              icon="pi pi-check"
              onClick={handleAccrue}
              loading={accruing}
            />
          </div>
        </div>
      </Dialog>

      {/* Result Dialog */}
      <Dialog
        header="Resultado de Acumulación"
        visible={resultDialog}
        onHide={() => setResultDialog(false)}
        style={{ width: "500px" }}
        modal
      >
        {accrueResult && (
          <div className="flex flex-column gap-3 p-2">
            <div className="text-lg font-medium">
              Procesados: {accrueResult.processed} empleados
            </div>
            <DataTable
              value={accrueResult.results}
              size="small"
              scrollable
              scrollHeight="300px"
            >
              <Column field="employeeId" header="Empleado" />
              <Column
                field="monto"
                header="Monto"
                body={(r) => fmt(r.monto ?? 0)}
              />
              <Column
                field="status"
                header="Estado"
                body={(r) => (
                  <Tag
                    value={
                      r.status === "created"
                        ? "Creado"
                        : r.status === "already_exists"
                        ? "Ya existe"
                        : "Error"
                    }
                    severity={
                      r.status === "created"
                        ? "success"
                        : r.status === "already_exists"
                        ? "warning"
                        : "danger"
                    }
                  />
                )}
              />
            </DataTable>
            <div className="flex justify-content-end">
              <Button label="Cerrar" onClick={() => setResultDialog(false)} />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
