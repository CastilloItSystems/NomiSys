"use client";

import { Page } from "@/types";
import EmployeeForm from "@/modules/nomina/employees/components/EmployeeForm";
import { useEmployeeData } from "@/modules/nomina/employees/hooks/useEmployeesData";
import { Skeleton } from "primereact/skeleton";

const EditEmployeePage: Page = ({ params }: { params: { id: string } }) => {
  const [employee, isLoading, error] = useEmployeeData(params.id);

  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton height="500px" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-4">
        <div className="p-card surface-card text-center">
          <i className="pi pi-exclamation-triangle text-4xl text-red-500 block mb-3" />
          <h3>Error al cargar empleado</h3>
          <p>{error?.message || "El empleado no fue encontrado"}</p>
        </div>
      </div>
    );
  }

  return <EmployeeForm employee={employee} isNew={false} />;
};

export default EditEmployeePage;
