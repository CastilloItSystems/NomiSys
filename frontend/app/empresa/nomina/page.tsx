"use client";

import React from "react";
import { Page } from "@/types";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const NominaPage: Page = () => {
  // --- 5. GRÁFICO 1: Nómina por departamento ---
  const deptData = [
    { name: "Administración", cost: 70000 },
    { name: "Ventas", cost: 120000 },
    { name: "Operaciones", cost: 180000 },
    { name: "RRHH", cost: 35000 },
    { name: "Tecnología", cost: 95000 },
    { name: "Logística", cost: 55230 },
  ];

  // --- 5. GRÁFICO 2: Asignaciones vs Deducciones ---
  const asigVsDedData = [
    { name: "Asignaciones", value: 485230, fill: "#22c55e" }, // green-500
    { name: "Deducciones", value: 74430, fill: "#ef4444" },   // red-500
  ];

  // --- 6. GRÁFICO 3: Distribución por concepto ---
  const conceptoData = [
    { name: "Salario base", value: 66, fill: "#3b82f6" },       // blue-500
    { name: "Bono alimentación", value: 15, fill: "#22c55e" },  // green-500
    { name: "Bonificaciones", value: 10, fill: "#f97316" },     // orange-500
    { name: "Comisiones", value: 6, fill: "#8b5cf6" },          // violet-500
    { name: "Horas extra", value: 3, fill: "#0ea5e9" },         // cyan-500
  ];

  // --- 7. TABLA 1: Últimas corridas ---
  const ultimasCorridas = [
    { id: 1, period: "01-15 Mar 2026", date: "15/03/2026", employees: 135, net: 398000, status: "Cerrada" },
    { id: 2, period: "16-31 Mar 2026", date: "31/03/2026", employees: 137, net: 405300, status: "Cerrada" },
    { id: 3, period: "01-15 Abr 2026", date: "15/04/2026", employees: 138, net: 410800, status: "En revisión" },
    { id: 4, period: "Extraordinaria Abr 2026", date: "18/04/2026", employees: 12, net: 24500, status: "Borrador" },
  ];

  // --- 7. TABLA 2: Incidencias y excepciones ---
  const incidencias = [
    { id: 1, emp: "María González", code: "EMP-001", dept: "RRHH", type: "Bono", impact: "+Bs. 3,500", status: "Aprobado" },
    { id: 2, emp: "Pedro Salas", code: "EMP-002", dept: "Administración", type: "Anticipo", impact: "-Bs. 1,200", status: "Aplicado" },
    { id: 3, emp: "Laura Pérez", code: "EMP-003", dept: "Ventas", type: "Comisión", impact: "+Bs. 5,000", status: "Pendiente" },
    { id: 4, emp: "José Ramírez", code: "EMP-004", dept: "Operaciones", type: "Falta", impact: "-Bs. 850", status: "Aplicado" },
    { id: 5, emp: "Ana Torres", code: "EMP-005", dept: "Tecnología", type: "Horas extra", impact: "+Bs. 1,750", status: "Aprobado" },
    { id: 6, emp: "Carlos Méndez", code: "EMP-006", dept: "Logística", type: "Error de salario", impact: "Revisión", status: "Pendiente" },
  ];

  // Helpers
  const formatBs = (value: number) => {
    return new Intl.NumberFormat("es-VE", { style: "currency", currency: "VES" }).format(value);
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case "Cerrada": return "success";
      case "En revisión": return "warning";
      case "Borrador": return "info";
      case "Rechazada": return "danger";
      case "Aprobado": return "success";
      case "Aplicado": return "info";
      case "Pendiente": return "warning";
      case "Error": return "danger";
      default: return "info";
    }
  };

  const statusTemplate = (rowData: any) => <Tag value={rowData.status} severity={getStatusSeverity(rowData.status)} />;
  const netTemplate = (rowData: any) => formatBs(rowData.net);
  const actionTemplate = () => <Button icon="pi pi-search" rounded text aria-label="Ver detalle" />;

  return (
    <div className="grid">
      <div className="col-12">
        <div className="flex justify-content-between align-items-center mb-4">
          <h2 className="m-0">Dashboard de Nómina</h2>
          <span className="text-500 font-medium">Período Actual: Abril 2026</span>
        </div>
      </div>

      {/* --- 4. CARDS KPI SUPERIORES --- */}
      {/* Card 1: Nómina total */}
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <div className="surface-card shadow-2 p-3 border-round h-full border-top-3 border-blue-500">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-600 font-medium mb-2">Nómina total</span>
              <div className="text-900 font-bold text-2xl">{formatBs(485230)}</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: "3rem", height: "3rem" }}>
              <i className="pi pi-wallet text-blue-500 text-xl"></i>
            </div>
          </div>
          <span className="text-green-500 font-medium">+8.2% </span>
          <span className="text-500 text-sm">vs período anterior</span>
        </div>
      </div>

      {/* Card 2: Neto a pagar */}
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <div className="surface-card shadow-2 p-3 border-round h-full border-top-3 border-green-500">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-600 font-medium mb-2">Neto a pagar</span>
              <div className="text-900 font-bold text-2xl">{formatBs(410800)}</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: "3rem", height: "3rem" }}>
              <i className="pi pi-money-bill text-green-500 text-xl"></i>
            </div>
          </div>
          <span className="text-500 text-sm">Después de deducciones</span>
        </div>
      </div>

      {/* Card 3: Empleados procesados */}
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <div className="surface-card shadow-2 p-3 border-round h-full border-top-3 border-indigo-500">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-600 font-medium mb-2">Empleados procesados</span>
              <div className="text-900 font-bold text-2xl">138</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-indigo-100 border-round" style={{ width: "3rem", height: "3rem" }}>
              <i className="pi pi-users text-indigo-500 text-xl"></i>
            </div>
          </div>
          <span className="text-orange-500 font-medium">5 pendientes</span>
        </div>
      </div>

      {/* Card 4: Total deducciones */}
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <div className="surface-card shadow-2 p-3 border-round h-full border-top-3 border-pink-400">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-600 font-medium mb-2">Deducciones</span>
              <div className="text-900 font-bold text-2xl">{formatBs(74430)}</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-pink-100 border-round" style={{ width: "3rem", height: "3rem" }}>
              <i className="pi pi-minus-circle text-pink-500 text-xl"></i>
            </div>
          </div>
          <span className="text-500 text-sm">15.3% de la nómina</span>
        </div>
      </div>

      {/* Card 5: Bono de alimentación */}
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <div className="surface-card shadow-2 p-3 border-round h-full border-top-3 border-orange-500">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-600 font-medium mb-2">Bono de alimentación</span>
              <div className="text-900 font-bold text-2xl">{formatBs(72500)}</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: "3rem", height: "3rem" }}>
              <i className="pi pi-ticket text-orange-500 text-xl"></i>
            </div>
          </div>
          <span className="text-500 text-sm">132 empleados impactados</span>
        </div>
      </div>

      {/* Card 6: Estado corrida */}
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <div className="surface-card shadow-2 p-3 border-round h-full border-top-3 border-yellow-500">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-600 font-medium mb-2">Corrida actual</span>
              <div className="text-yellow-600 font-bold text-2xl">En revisión</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-yellow-100 border-round" style={{ width: "3rem", height: "3rem" }}>
              <i className="pi pi-clock text-yellow-600 text-xl"></i>
            </div>
          </div>
          <span className="text-500 text-sm">Cierre estimado: 10/04/2026</span>
        </div>
      </div>

      {/* --- KPIs ANTERIORES INTEGRADOS --- */}
      {/* Card 7: Costo Nómina (Mes) */}
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <div className="surface-card shadow-2 p-3 border-round h-full border-top-3 border-cyan-500">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-600 font-medium mb-2">Costo Nómina (Mes)</span>
              <div className="text-900 font-bold text-2xl">{formatBs(125000)}</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: "3rem", height: "3rem" }}>
              <i className="pi pi-dollar text-cyan-500 text-xl"></i>
            </div>
          </div>
          <span className="text-green-500 font-medium">+2.5% </span>
          <span className="text-500 text-sm">desde el mes pasado</span>
        </div>
      </div>

      {/* Card 8: Empleados Activos */}
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <div className="surface-card shadow-2 p-3 border-round h-full border-top-3 border-teal-500">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-600 font-medium mb-2">Empleados Activos</span>
              <div className="text-900 font-bold text-2xl">142</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-teal-100 border-round" style={{ width: "3rem", height: "3rem" }}>
              <i className="pi pi-users text-teal-500 text-xl"></i>
            </div>
          </div>
          <span className="text-green-500 font-medium">3 </span>
          <span className="text-500 text-sm">nuevos ingresos</span>
        </div>
      </div>

      {/* Card 9: En Vacaciones */}
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <div className="surface-card shadow-2 p-3 border-round h-full border-top-3 border-amber-500">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-600 font-medium mb-2">En Vacaciones</span>
              <div className="text-900 font-bold text-2xl">8</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-amber-100 border-round" style={{ width: "3rem", height: "3rem" }}>
              <i className="pi pi-sun text-amber-500 text-xl"></i>
            </div>
          </div>
          <span className="text-500 text-sm">Actualmente disfrutando</span>
        </div>
      </div>

      {/* Card 10: Vencimientos (Mes) */}
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <div className="surface-card shadow-2 p-3 border-round h-full border-top-3 border-red-500">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-600 font-medium mb-2">Vencimientos (Mes)</span>
              <div className="text-900 font-bold text-2xl">5</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: "3rem", height: "3rem" }}>
              <i className="pi pi-file text-red-500 text-xl"></i>
            </div>
          </div>
          <span className="text-red-500 font-medium">Atención requerida</span>
        </div>
      </div>

      {/* --- KPIs ADICIONALES SUGERIDOS --- */}
      {/* Card 11: Salario Promedio */}
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <div className="surface-card shadow-2 p-3 border-round h-full border-top-3 border-purple-500">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-600 font-medium mb-2">Salario Promedio</span>
              <div className="text-900 font-bold text-2xl">{formatBs(3500)}</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: "3rem", height: "3rem" }}>
              <i className="pi pi-chart-line text-purple-500 text-xl"></i>
            </div>
          </div>
          <span className="text-500 text-sm">Por empleado activo</span>
        </div>
      </div>

      {/* Card 12: Total Horas Extras */}
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <div className="surface-card shadow-2 p-3 border-round h-full border-top-3 border-lime-500">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-600 font-medium mb-2">Total Horas Extras</span>
              <div className="text-900 font-bold text-2xl">{formatBs(12500)}</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-lime-100 border-round" style={{ width: "3rem", height: "3rem" }}>
              <i className="pi pi-clock text-lime-500 text-xl"></i>
            </div>
          </div>
          <span className="text-500 text-sm">Monto total del período</span>
        </div>
      </div>

      {/* --- 5. GRÁFICOS PRINCIPALES --- */}
      <div className="col-12 xl:col-8">
        <div className="surface-card shadow-2 p-4 border-round h-full">
          <div className="mb-4">
            <h5 className="m-0 font-bold text-lg">Costo de nómina por departamento</h5>
            <span className="text-500 text-sm">Distribución del gasto del período actual</span>
          </div>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer>
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} angle={-25} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(val) => `Bs.${val/1000}k`} />
                <Tooltip cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} formatter={(value: number) => formatBs(value)} />
                <Bar dataKey="cost" name="Costo" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="col-12 xl:col-4">
        <div className="surface-card shadow-2 p-4 border-round h-full">
          <div className="mb-4">
            <h5 className="m-0 font-bold text-lg">Asignaciones vs Deducciones</h5>
            <span className="text-500 text-sm">Comparativa total</span>
          </div>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer>
              <BarChart data={asigVsDedData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(val) => `${val/1000}k`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 13, fontWeight: 500}} width={100} />
                <Tooltip cursor={{fill: 'rgba(0, 0, 0, 0.02)'}} formatter={(value: number) => formatBs(value)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={50}>
                  {asigVsDedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- 6. FILA INTERMEDIA --- */}
      <div className="col-12 xl:col-6">
        <div className="surface-card shadow-2 p-4 border-round h-full">
          <div className="mb-2">
            <h5 className="m-0 font-bold text-lg">Distribución por concepto</h5>
            <span className="text-500 text-sm">Composición de la nómina del período</span>
          </div>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={conceptoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {conceptoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="col-12 xl:col-6">
        <div className="surface-card shadow-2 p-4 border-round h-full">
          <div className="mb-4">
            <h5 className="m-0 font-bold text-lg">Alertas operativas</h5>
            <span className="text-500 text-sm">Novedades que requieren atención</span>
          </div>
          
          <ul className="list-none p-0 m-0">
            <li className="flex align-items-center py-3 px-2 border-bottom-1 surface-border">
              <div className="flex align-items-center justify-content-center bg-yellow-100 border-round mr-3" style={{ width: "2.5rem", height: "2.5rem" }}>
                <i className="pi pi-credit-card text-yellow-600 text-lg"></i>
              </div>
              <span className="text-700 font-medium flex-1">5 empleados sin cuenta bancaria registrada</span>
            </li>
            <li className="flex align-items-center py-3 px-2 border-bottom-1 surface-border">
              <div className="flex align-items-center justify-content-center bg-yellow-100 border-round mr-3" style={{ width: "2.5rem", height: "2.5rem" }}>
                <i className="pi pi-folder-open text-yellow-600 text-lg"></i>
              </div>
              <span className="text-700 font-medium flex-1">3 empleados con expediente incompleto</span>
            </li>
            <li className="flex align-items-center py-3 px-2 border-bottom-1 surface-border">
              <div className="flex align-items-center justify-content-center bg-blue-100 border-round mr-3" style={{ width: "2.5rem", height: "2.5rem" }}>
                <i className="pi pi-question-circle text-blue-500 text-lg"></i>
              </div>
              <span className="text-700 font-medium flex-1">4 incidencias pendientes de aprobación</span>
            </li>
            <li className="flex align-items-center py-3 px-2 border-bottom-1 surface-border">
              <div className="flex align-items-center justify-content-center bg-red-100 border-round mr-3" style={{ width: "2.5rem", height: "2.5rem" }}>
                <i className="pi pi-exclamation-triangle text-red-500 text-lg"></i>
              </div>
              <span className="text-700 font-medium flex-1">2 errores de cálculo detectados</span>
            </li>
            <li className="flex align-items-center py-3 px-2 border-bottom-1 surface-border">
              <div className="flex align-items-center justify-content-center bg-red-100 border-round mr-3" style={{ width: "2.5rem", height: "2.5rem" }}>
                <i className="pi pi-cog text-red-500 text-lg"></i>
              </div>
              <span className="text-700 font-medium flex-1">1 concepto de deducción sin configuración completa</span>
            </li>
            <li className="flex align-items-center py-3 px-2">
              <div className="flex align-items-center justify-content-center bg-blue-100 border-round mr-3" style={{ width: "2.5rem", height: "2.5rem" }}>
                <i className="pi pi-history text-blue-500 text-lg"></i>
              </div>
              <span className="text-700 font-medium flex-1">1 corrida anterior reabierta</span>
            </li>
          </ul>
        </div>
      </div>

      {/* --- 7. TABLAS INFERIORES --- */}
      <div className="col-12">
        <div className="surface-card shadow-2 p-4 border-round">
          <div className="mb-4">
            <h5 className="m-0 font-bold text-lg">Últimas corridas</h5>
          </div>
          <DataTable value={ultimasCorridas} responsiveLayout="scroll" className="p-datatable-sm">
            <Column field="period" header="Período" className="font-medium" />
            <Column field="date" header="Fecha de pago" />
            <Column field="employees" header="Empleados" align="center" />
            <Column field="net" header="Neto total" body={netTemplate} />
            <Column field="status" header="Estado" body={statusTemplate} />
            <Column header="Acción" body={actionTemplate} align="center" />
          </DataTable>
        </div>
      </div>

      <div className="col-12">
        <div className="surface-card shadow-2 p-4 border-round">
          <div className="mb-4">
            <h5 className="m-0 font-bold text-lg">Incidencias y excepciones</h5>
          </div>
          <DataTable value={incidencias} responsiveLayout="scroll" className="p-datatable-sm" stripedRows>
            <Column field="emp" header="Empleado" className="font-medium" />
            <Column field="code" header="Código" />
            <Column field="dept" header="Departamento" />
            <Column field="type" header="Tipo de incidencia" />
            <Column field="impact" header="Impacto" className="font-bold" />
            <Column field="status" header="Estado" body={statusTemplate} />
          </DataTable>
        </div>
      </div>

    </div>
  );
};

export default NominaPage;
