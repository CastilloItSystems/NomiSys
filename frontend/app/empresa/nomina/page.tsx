"use client";

import { Page } from "@/types";

const NominaPage: Page = () => {
  return (
    <div className="flex flex-column gap-4">
      <h2>Nómina</h2>
      <p>
        Bienvenido al módulo de Nómina. Selecciona una opción del menú para
        continuar.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-card p-3 surface-card border-round">
          <h4>Empleados</h4>
          <p className="text-sm">Gestiona la información de tus empleados</p>
        </div>
        <div className="p-card p-3 surface-card border-round">
          <h4>Departamentos</h4>
          <p className="text-sm">Configura los departamentos de la empresa</p>
        </div>
        <div className="p-card p-3 surface-card border-round">
          <h4>Cargos</h4>
          <p className="text-sm">Define los cargos y posiciones disponibles</p>
        </div>
        <div className="p-card p-3 surface-card border-round">
          <h4>Bancos</h4>
          <p className="text-sm">Catálogo de bancos para depósitos</p>
        </div>
      </div>
    </div>
  );
};

export default NominaPage;
