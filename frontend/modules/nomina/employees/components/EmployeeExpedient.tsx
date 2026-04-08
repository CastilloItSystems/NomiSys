"use client";

import { useRef, useState, useMemo } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useRouter } from "next/navigation";
import { classNames } from "primereact/utils";

import { useEmployee } from "@/modules/nomina/employees/hooks/useEmployeesData";
import { usePositionsData } from "@/modules/nomina/positions/hooks/usePositionsData";
import { useDepartmentsData } from "@/modules/nomina/departments/hooks/useDepartmentsData";
import { formatDateFH } from "@/utils/dateUtils";

interface EmployeeExpedientProps {
  employeeId: string;
  onClose?: () => void;
}

export default function EmployeeExpedient({
  employeeId,
  onClose,
}: EmployeeExpedientProps) {
  const toast = useRef<Toast>(null);
  const router = useRouter();
  console.log(employeeId);
  const {
    employee,
    jobInfo,
    loading: isLoading,
    error,
  } = useEmployee(employeeId);
  console.log(employee);
  const { positions } = usePositionsData();
  const { departments } = useDepartmentsData();

  const positionName = useMemo(
    () =>
      positions.find((p) => p.id === jobInfo?.positionId)?.name ??
      jobInfo?.positionId ??
      "-",
    [positions, jobInfo?.positionId],
  );
  const departmentName = useMemo(
    () =>
      departments.find((d) => d.id === jobInfo?.departmentId)?.name ??
      jobInfo?.departmentId ??
      "-",
    [departments, jobInfo?.departmentId],
  );
  const [showDialog, setShowDialog] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const handleClose = () => {
    setShowDialog(false);
    if (onClose) onClose();
    else router.push("/empresa/nomina/empleados");
  };

  const handleEdit = () => {
    // Close expedient first if in modal mode
    if (onClose) {
      setShowDialog(false);
      setTimeout(() => onClose(), 300);
      // Then navigate to edit page
      setTimeout(() => {
        router.push(`/empresa/nomina/empleados/${employeeId}/editar`);
      }, 300);
    } else {
      // Standalone mode - just navigate
      router.push(`/empresa/nomina/empleados/${employeeId}/editar`);
    }
  };

  if (error) {
    return (
      <>
        <Toast ref={toast} />
        <Dialog
          visible={showDialog}
          onHide={handleClose}
          header="Error"
          modal
          style={{ width: "500px" }}
        >
          <div className="text-center">
            <i className="pi pi-exclamation-triangle text-4xl text-red-500 mb-3" />
            <p>
              Error al cargar el empleado:{" "}
              {(error as any)?.message || "Error desconocido"}
            </p>
            <Button label="Cerrar" onClick={handleClose} className="mt-3" />
          </div>
        </Dialog>
      </>
    );
  }

  const tabsHeader = [
    { title: "Resumen", icon: "pi-list" },
    { title: "Datos Personales", icon: "pi-user" },
    { title: "Datos Laborales", icon: "pi-briefcase" },
    { title: "Seg. Social", icon: "pi-shield" },
    { title: "Bancarios", icon: "pi-money-bill" },
    { title: "Historial", icon: "pi-history" },
    { title: "Auditoría", icon: "pi-book" },
  ];

  const currentTab = tabsHeader[activeTab];

  return (
    <>
      <Toast ref={toast} />

      <Dialog
        visible={showDialog}
        onHide={handleClose}
        header={
          <div className="flex align-items-center gap-2">
            <i className={classNames("pi", `pi-${currentTab.icon}`)} />
            <span>
              {isLoading
                ? "Cargando..."
                : `Expediente de ${employee?.firstName} ${employee?.lastName}`}{" "}
              — {currentTab.title}
            </span>
          </div>
        }
        modal
        maximizable
        style={{ width: "90vw", height: "90vh" }}
        footer={
          <div className="flex gap-2 justify-content-between">
            <div>
              <Button
                label="Anterior"
                icon="pi pi-chevron-left"
                onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                disabled={activeTab === 0}
              />
              <Button
                label="Siguiente"
                icon="pi-chevron-right"
                iconPos="right"
                onClick={() => setActiveTab(Math.min(6, activeTab + 1))}
                disabled={activeTab === 6}
                className="ml-2"
              />
            </div>
            <div>
              <Button label="Editar" icon="pi pi-pencil" onClick={handleEdit} />
              <Button
                label="Cerrar"
                severity="secondary"
                onClick={handleClose}
                className="ml-2"
              />
            </div>
          </div>
        }
      >
        <TabView
          activeIndex={activeTab}
          onTabChange={(e) => setActiveTab(e.index)}
        >
          {/* Tab 1: Resumen */}
          <TabPanel header="Resumen" leftIcon="pi pi-list">
            <div className="p-3">
              {isLoading ? (
                <Skeleton height="300px" />
              ) : employee ? (
                <div className="grid">
                  <div className="col-12 lg:col-6">
                    <Card
                      title="Información General"
                      className="mb-3 h-full shadow-2"
                    >
                      <div className="grid formgrid">
                        <div className="field col-12">
                          <label className="font-semibold text-500 block mb-1">
                            Código
                          </label>
                          <p className="m-0 text-900 text-lg">
                            {employee.employeeCode}
                          </p>
                        </div>
                        <div className="field col-12 md:col-6">
                          <label className="font-semibold text-500 block mb-1">
                            Nombre Completo
                          </label>
                          <p className="m-0 text-900">
                            {employee.firstName} {employee.lastName}
                          </p>
                        </div>
                        <div className="field col-12 md:col-6">
                          <label className="font-semibold text-500 block mb-1">
                            Documento
                          </label>
                          <p className="m-0 text-900">
                            {employee.documentType} - {employee.documentNumber}
                          </p>
                        </div>
                        <div className="field col-12 md:col-6">
                          <label className="font-semibold text-500 block mb-1">
                            Email
                          </label>
                          <p className="m-0 text-900">
                            {employee.email || "-"}
                          </p>
                        </div>
                        <div className="field col-12 md:col-6">
                          <label className="font-semibold text-500 block mb-1">
                            Teléfono
                          </label>
                          <p className="m-0 text-900">{employee.phone}</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="col-12 lg:col-6">
                    <Card
                      title="Información Laboral"
                      className="mb-3 h-full shadow-2"
                    >
                      <div className="grid formgrid">
                        <div className="field col-12">
                          <label className="font-semibold text-500 block mb-1">
                            Posición
                          </label>
                          <p className="m-0 text-900 font-medium">
                            {positionName}
                          </p>
                        </div>
                        <div className="field col-12 md:col-6">
                          <label className="font-semibold text-500 block mb-1">
                            Departamento
                          </label>
                          <p className="m-0 text-900">{departmentName}</p>
                        </div>
                        <div className="field col-12 md:col-6">
                          <label className="font-semibold text-500 block mb-1">
                            Fecha de Inicio
                          </label>
                          <p className="m-0 text-900">
                            {formatDateFH(employee.hireDate)}
                          </p>
                        </div>
                        <div className="field col-12 md:col-6">
                          <label className="font-semibold text-500 block mb-1">
                            Estado
                          </label>
                          <p className="m-0">
                            <span
                              className={classNames(
                                "px-3 py-1 border-round-xl text-sm font-semibold",
                                employee.status === "ACTIVE"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700",
                              )}
                            >
                              {employee.status === "ACTIVE"
                                ? "Activo"
                                : employee.status}
                            </span>
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                <p>No hay datos disponibles</p>
              )}
            </div>
          </TabPanel>

          {/* Tab 2: Personal Data */}
          <TabPanel header="Datos Personales" leftIcon="pi pi-user">
            <div className="p-3">
              {isLoading ? (
                <Skeleton height="300px" />
              ) : employee ? (
                <div className="grid formgrid">
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      Primer Nombre
                    </label>
                    <p className="m-0 text-900">{employee.firstName}</p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      Segundo Nombre
                    </label>
                    <p className="m-0 text-900">{employee.middleName || "-"}</p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      Primer Apellido
                    </label>
                    <p className="m-0 text-900">{employee.lastName}</p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      Segundo Apellido
                    </label>
                    <p className="m-0 text-900">
                      {employee.secondLastName || "-"}
                    </p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-4">
                    <label className="font-semibold text-500 block mb-1">
                      Tipo de Documento
                    </label>
                    <p className="m-0 text-900">{employee.documentType}</p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-4">
                    <label className="font-semibold text-500 block mb-1">
                      Número de Documento
                    </label>
                    <p className="m-0 text-900">{employee.documentNumber}</p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-4">
                    <label className="font-semibold text-500 block mb-1">
                      Fecha de Nacimiento
                    </label>
                    <p className="m-0 text-900">
                      {formatDateFH(employee.birthDate)}
                    </p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-4">
                    <label className="font-semibold text-500 block mb-1">
                      Género
                    </label>
                    <p className="m-0 text-900">{employee.gender || "-"}</p>
                  </div>
                  <div className="field col-12 lg:col-8">
                    <label className="font-semibold text-500 block mb-1">
                      Dirección
                    </label>
                    <p className="m-0 text-900">{employee.address}</p>
                  </div>
                </div>
              ) : (
                <p>No hay datos disponibles</p>
              )}
            </div>
          </TabPanel>

          {/* Tab 3: Laboral Data */}
          <TabPanel header="Datos Laborales" leftIcon="pi pi-briefcase">
            <div className="p-3">
              {isLoading ? (
                <Skeleton height="300px" />
              ) : jobInfo ? (
                <div className="grid formgrid">
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      Código de Empleado
                    </label>
                    <p className="m-0 text-900">{employee?.employeeCode}</p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      Fecha de Incorporación
                    </label>
                    <p className="m-0 text-900">
                      {formatDateFH(jobInfo.effectiveDate)}
                    </p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      Posición
                    </label>
                    <p className="m-0 text-900">{positionName}</p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      Departamento
                    </label>
                    <p className="m-0 text-900">{departmentName}</p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      Centro de Costo
                    </label>
                    <p className="m-0 text-900">{jobInfo.costCenter || "-"}</p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      Tipo de Contrato
                    </label>
                    <p className="m-0 text-900">{jobInfo.contractType}</p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      Jornada Laboral
                    </label>
                    <p className="m-0 text-900">{jobInfo.workShift}</p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      Supervisor
                    </label>
                    <p className="m-0 text-900">
                      {jobInfo.supervisorId || "-"}
                    </p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      Frecuencia de Pago
                    </label>
                    <p className="m-0 text-900">{jobInfo.payFrequency}</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  No hay información laboral disponible
                </p>
              )}
            </div>
          </TabPanel>

          {/* Tab 4: Social Security */}
          <TabPanel header="Seg. Social" leftIcon="pi pi-shield">
            <div className="p-3">
              {isLoading ? (
                <Skeleton height="300px" />
              ) : employee ? (
                <div className="grid formgrid">
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      IVSS
                    </label>
                    <p className="m-0 text-900">{employee.ivssNumber || "-"}</p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      RIF
                    </label>
                    <p className="m-0 text-900">{employee.rifNumber || "-"}</p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      ¿Afiliado a FAOV?
                    </label>
                    <p className="m-0">
                      <span
                        className={classNames(
                          "px-3 py-1 border-round-xl text-sm font-semibold",
                          employee.isFaovEnrolled
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700",
                        )}
                      >
                        {employee.isFaovEnrolled ? "Sí" : "No"}
                      </span>
                    </p>
                  </div>
                  <div className="field col-12 md:col-6 lg:col-3">
                    <label className="font-semibold text-500 block mb-1">
                      ¿Afiliado a INCES?
                    </label>
                    <p className="m-0">
                      <span
                        className={classNames(
                          "px-3 py-1 border-round-xl text-sm font-semibold",
                          employee.isIncesEnrolled
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700",
                        )}
                      >
                        {employee.isIncesEnrolled ? "Sí" : "No"}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <p>No hay datos disponibles</p>
              )}
            </div>
          </TabPanel>

          {/* Tab 5: Banking */}
          <TabPanel header="Bancarios" leftIcon="pi pi-money-bill">
            <div className="p-3">
              <div className="text-center text-gray-500">
                <i className="pi pi-info-circle text-2xl mb-3 block" />
                <p>Información disponible en datos adicionales</p>
              </div>
            </div>
          </TabPanel>

          {/* Tab 6: Historial (Placeholder for Phase 2) */}
          <TabPanel header="Historial" leftIcon="pi pi-history">
            <div className="p-3">
              <div className="text-center text-gray-500">
                <i className="pi pi-info-circle text-2xl mb-3 block" />
                <p>Funcionalidad disponible en Fase 2</p>
                <small>Se incluirá historial de cambios y movimientos</small>
              </div>
            </div>
          </TabPanel>

          {/* Tab 7: Auditoría */}
          <TabPanel header="Auditoría" leftIcon="pi pi-book">
            <div className="p-3">
              <div className="text-center text-gray-500">
                <i className="pi pi-info-circle text-2xl mb-3 block" />
                <p>Funcionalidad disponible en Fase 2</p>
                <small>
                  Se incluirá registro de auditoría y cambios del empleado
                </small>
              </div>
            </div>
          </TabPanel>
        </TabView>
      </Dialog>
    </>
  );
}
