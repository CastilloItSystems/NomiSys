"use client";

import Link from "next/link";
import type { Page } from "@/types";

const ReportesPage: Page = () => {
  const reportes = [
    {
      title: "Reporte Fiscal",
      description:
        "Resumen fiscal de nómina para declaraciones ante organismos del Estado.",
      href: "/empresa/nomina/reportes/fiscal",
      icon: "pi pi-file-pdf",
    },
    {
      title: "Historial de Pagos",
      description:
        "Historial completo de todos los cálculos de nómina procesados y pagados.",
      href: "/empresa/nomina/reportes/historial",
      icon: "pi pi-history",
    },
  ];

  return (
    <div className="flex flex-column gap-4">
      <div className="card">
        <h4 className="m-0 mb-1">Reportes de Nómina</h4>
        <p className="text-600 m-0">
          Seleccione el tipo de reporte que desea generar.
        </p>
      </div>
      <div className="grid">
        {reportes.map((r) => (
          <div key={r.href} className="col-12 md:col-6 lg:col-4">
            <Link href={r.href} style={{ textDecoration: "none" }}>
              <div className="card h-full flex flex-column align-items-center gap-3 p-4 cursor-pointer hover:surface-100 transition-colors transition-duration-150">
                <i
                  className={r.icon + " text-primary"}
                  style={{ fontSize: "2.5rem" }}
                />
                <div className="text-center">
                  <h5 className="m-0 mb-2">{r.title}</h5>
                  <p className="text-600 text-sm m-0">{r.description}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportesPage;
