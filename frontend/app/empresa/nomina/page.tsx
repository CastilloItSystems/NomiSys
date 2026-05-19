"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Page } from "@/types";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePayrollRunsData } from "@/modules/nomina/payroll-runs/hooks/usePayrollRunsData";
import { useEmployeesData } from "@/modules/nomina/employees/hooks/useEmployeesData";
import { PayrollRun } from "@/modules/nomina/payroll-runs/interfaces/payrollRun.interface";

const NominaPage: Page = () => {
  const router = useRouter();

  const { runs, loading: runsLoading } = usePayrollRunsData({ limit: 6 });
  const { total: totalEmployees, loading: empLoading } = useEmployeesData(0, 1);

  // Derive KPIs from the latest non-Borrador run
  const latestRun: PayrollRun | undefined =
    runs.find((r) => r.status !== "Borrador" && r.status !== "Anulado") ??
    runs[0];

  const formatBs = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case "Pagado":
        return "success";
      case "Aprobado":
        return "success";
      case "Procesado":
        return "info";
      case "Procesando":
        return "info";
      case "Borrador":
        return "secondary";
      case "Anulado":
        return "danger";
      default:
        return "secondary";
    }
  };

  const statusTemplate = (rowData: PayrollRun) => (
    <Tag
      value={rowData.status}
      severity={getStatusSeverity(rowData.status) as any}
    />
  );
  const netTemplate = (rowData: PayrollRun) => formatBs(rowData.totalNet);
  const grossTemplate = (rowData: PayrollRun) => formatBs(rowData.totalGross);
  const actionTemplate = (rowData: PayrollRun) => (
    <Button
      icon="pi pi-search"
      rounded
      text
      aria-label="Ver detalle"
      onClick={() => router.push(`/empresa/nomina/calculo?id=${rowData.id}`)}
    />
  );

  // Build a simple bar chart with what we have
  const chartData = runs
    .filter((r) => r.status !== "Anulado")
    .slice(0, 5)
    .map((r) => ({
      name: r.id.slice(-6),
      bruto: r.totalGross,
      neto: r.totalNet,
    }))
    .reverse();

  const grossValue = latestRun ? latestRun.totalGross : 0;
  const netValue = latestRun ? latestRun.totalNet : 0;
  const deductValue = latestRun ? latestRun.totalDeductions : 0;
  const empCount = latestRun ? latestRun.employeeCount : 0;

  const KpiCard = ({
    label,
    value,
    icon,
    iconBg,
    iconColor,
    borderColor,
    subtitle,
    loading,
  }: {
    label: string;
    value: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    borderColor: string;
    subtitle?: string;
    loading?: boolean;
  }) => (
    <div className="col-12 md:col-6 lg:col-4 xl:col-2">
      <div
        className={`surface-card shadow-2 p-3 border-round h-full border-top-3 ${borderColor}`}
      >
        <div className="flex justify-content-between mb-3">
          <div>
            <span className="block text-600 font-medium mb-2">{label}</span>
            {loading ? (
              <Skeleton width="8rem" height="2rem" />
            ) : (
              <div className="text-900 font-bold text-2xl">{value}</div>
            )}
          </div>
          <div
            className={`flex align-items-center justify-content-center ${iconBg} border-round`}
            style={{ width: "3rem", height: "3rem" }}
          >
            <i className={`${icon} ${iconColor} text-xl`}></i>
          </div>
        </div>
        {subtitle && <span className="text-500 text-sm">{subtitle}</span>}
      </div>
    </div>
  );

  return (
    <div className="grid">
      <div className="col-12">
        <div className="flex justify-content-between align-items-center mb-4">
          <h2 className="m-0">Dashboard de Nómina</h2>
          {latestRun && (
            <span className="text-500 font-medium">
              Último cálculo:{" "}
              <Tag
                value={latestRun.status}
                severity={getStatusSeverity(latestRun.status) as any}
              />
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCard
        label="Nómina bruta"
        value={formatBs(grossValue)}
        icon="pi pi-wallet"
        iconBg="bg-blue-100"
        iconColor="text-blue-500"
        borderColor="border-blue-500"
        subtitle={latestRun ? "Última corrida" : "Sin datos"}
        loading={runsLoading}
      />
      <KpiCard
        label="Neto a pagar"
        value={formatBs(netValue)}
        icon="pi pi-money-bill"
        iconBg="bg-green-100"
        iconColor="text-green-500"
        borderColor="border-green-500"
        subtitle="Después de deducciones"
        loading={runsLoading}
      />
      <KpiCard
        label="Empleados procesados"
        value={empCount.toString()}
        icon="pi pi-users"
        iconBg="bg-indigo-100"
        iconColor="text-indigo-500"
        borderColor="border-indigo-500"
        subtitle={`${totalEmployees} empleados activos`}
        loading={runsLoading || empLoading}
      />
      <KpiCard
        label="Total deducciones"
        value={formatBs(deductValue)}
        icon="pi pi-minus-circle"
        iconBg="bg-pink-100"
        iconColor="text-pink-500"
        borderColor="border-pink-400"
        subtitle={
          grossValue > 0
            ? `${((deductValue / grossValue) * 100).toFixed(1)}% de la nómina`
            : undefined
        }
        loading={runsLoading}
      />
      <KpiCard
        label="Corridas totales"
        value={runs.length.toString()}
        icon="pi pi-list"
        iconBg="bg-cyan-100"
        iconColor="text-cyan-500"
        borderColor="border-cyan-500"
        subtitle={`${runs.filter((r) => r.status === "Pagado").length} pagadas`}
        loading={runsLoading}
      />
      <KpiCard
        label="Empleados totales"
        value={totalEmployees.toString()}
        icon="pi pi-id-card"
        iconBg="bg-teal-100"
        iconColor="text-teal-500"
        borderColor="border-teal-500"
        subtitle="En la empresa"
        loading={empLoading}
      />

      {/* Chart: last 5 runs */}
      <div className="col-12">
        <div className="surface-card shadow-2 p-4 border-round">
          <div className="mb-4">
            <h5 className="m-0 font-bold text-lg">
              Evolución de nómina (últimas corridas)
            </h5>
            <span className="text-500 text-sm">Bruto vs Neto por corrida</span>
          </div>
          {runsLoading ? (
            <Skeleton height="300px" />
          ) : chartData.length === 0 ? (
            <div
              className="flex align-items-center justify-content-center"
              style={{ height: "300px" }}
            >
              <div className="text-center text-500">
                <i className="pi pi-chart-bar text-4xl mb-3 block" />
                <p>No hay corridas de nómina para graficar</p>
                <Button
                  label="Ir a Cálculo de Nómina"
                  icon="pi pi-arrow-right"
                  outlined
                  onClick={() => router.push("/empresa/nomina/calculo")}
                />
              </div>
            </div>
          ) : (
            <div style={{ width: "100%", height: "300px" }}>
              <ResponsiveContainer>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                    formatter={(value: number) => formatBs(value)}
                  />
                  <Bar
                    dataKey="bruto"
                    name="Bruto"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                  <Bar
                    dataKey="neto"
                    name="Neto"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Table: last runs */}
      <div className="col-12">
        <div className="surface-card shadow-2 p-4 border-round">
          <div className="flex justify-content-between align-items-center mb-4">
            <h5 className="m-0 font-bold text-lg">
              Últimas corridas de nómina
            </h5>
            <Button
              label="Ver todas"
              icon="pi pi-arrow-right"
              text
              onClick={() => router.push("/empresa/nomina/calculo")}
            />
          </div>
          {runsLoading ? (
            <Skeleton height="200px" />
          ) : runs.length === 0 ? (
            <div className="text-center text-500 py-5">
              <i className="pi pi-inbox text-4xl mb-3 block" />
              <p>No hay corridas de nómina registradas</p>
              <Button
                label="Crear primera corrida"
                icon="pi pi-plus"
                onClick={() => router.push("/empresa/nomina/calculo")}
              />
            </div>
          ) : (
            <DataTable
              value={runs}
              responsiveLayout="scroll"
              className="p-datatable-sm"
              rows={6}
            >
              <Column
                field="id"
                header="ID"
                body={(r: PayrollRun) => (
                  <span className="font-mono text-sm text-500">
                    {r.id.slice(-8).toUpperCase()}
                  </span>
                )}
              />
              <Column field="employeeCount" header="Empleados" align="center" />
              <Column header="Bruto" body={grossTemplate} />
              <Column header="Neto" body={netTemplate} />
              <Column
                field="createdAt"
                header="Creado"
                body={(r: PayrollRun) =>
                  new Date(r.createdAt).toLocaleDateString("es-VE")
                }
              />
              <Column field="status" header="Estado" body={statusTemplate} />
              <Column header="Acción" body={actionTemplate} align="center" />
            </DataTable>
          )}
        </div>
      </div>

      {/* Quick access */}
      <div className="col-12">
        <div className="surface-card shadow-2 p-4 border-round">
          <h5 className="m-0 font-bold text-lg mb-4">Acceso rápido</h5>
          <div className="grid">
            {[
              {
                label: "Empleados",
                icon: "pi pi-users",
                to: "/empresa/nomina/empleados",
                color: "blue",
              },
              {
                label: "Períodos",
                icon: "pi pi-calendar",
                to: "/empresa/nomina/periodos",
                color: "indigo",
              },
              {
                label: "Calcular Nómina",
                icon: "pi pi-calculator",
                to: "/empresa/nomina/calculo",
                color: "green",
              },
              {
                label: "Comprobantes",
                icon: "pi pi-file-pdf",
                to: "/empresa/nomina/comprobantes",
                color: "orange",
              },
              {
                label: "Reportes",
                icon: "pi pi-chart-bar",
                to: "/empresa/nomina/reportes",
                color: "purple",
              },
              {
                label: "Configuración",
                icon: "pi pi-cog",
                to: "/empresa/nomina/config/salarios",
                color: "gray",
              },
            ].map((item) => (
              <div key={item.to} className="col-6 md:col-4 lg:col-2">
                <div
                  className={`surface-hover border-round p-3 text-center cursor-pointer transition-colors transition-duration-150`}
                  onClick={() => router.push(item.to)}
                  style={{ cursor: "pointer" }}
                >
                  <i
                    className={`${item.icon} text-${item.color}-500 text-3xl block mb-2`}
                  />
                  <span className="text-700 font-medium text-sm">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NominaPage;
