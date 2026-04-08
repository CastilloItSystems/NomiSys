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
  const {
    employee,
    jobInfo,
    loading: isLoading,
    error,
  } = useEmployee(employeeId);
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
                    <Card title="Información General" className="mb-3">
                      <div className="grid gap-3">
                        <div className="col-12">
                          <label className="font-bold">Código</label>
                          <p>{employee.employeeCode}</p>
                        </div>
                        <div className="col-12 md:col-6">
                          <label className="font-bold">Nombre Completo</label>
                          <p>
                            {employee.firstName} {employee.lastName}
                          </p>
                        </div>
                        <div className="col-12 md:col-6">
                          <label className="font-bold">Documento</label>
                          <p>
                            {employee.documentType} - {employee.documentNumber}
                          </p>
                        </div>
                        <div className="col-12 md:col-6">
                          <label className="font-bold">Email</label>
                          <p>{employee.email || "-"}</p>
                        </div>
                        <div className="col-12 md:col-6">
                          <label className="font-bold">Teléfono</label>
                          <p>{employee.phone}</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="col-12 lg:col-6">
                    <Card title="Información Laboral" className="mb-3">
                      <div className="grid gap-3">
                        <div className="col-12">
                          <label className="font-bold">Posición</label>
                          <p>{positionName}</p>
                        </div>
                        <div className="col-12 md:col-6">
                          <label className="font-bold">Departamento</label>
                          <p>{departmentName}</p>
                        </div>
                        <div className="col-12 md:col-6">
                          <label className="font-bold">Fecha de Inicio</label>
                          <p>{formatDateFH(employee.hireDate)}</p>
                        </div>
                        <div className="col-12 md:col-6">
                          <label className="font-bold">Estado</label>
                          <p>
                            <span
                              className={classNames(
                                "surface-section px-3 py-2 border-round text-sm",
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
                <div className="grid gap-3">
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">
                      Primer Nombre
                    </label>
                    <p>{employee.firstName}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">
                      Segundo Nombre
                    </label>
                    <p>{employee.middleName || "-"}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">
                      Primer Apellido
                    </label>
                    <p>{employee.lastName}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">
                      Segundo Apellido
                    </label>
                    <p>{employee.secondLastName || "-"}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">
                      Tipo de Documento
                    </label>
                    <p>{employee.documentType}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">
                      Número de Documento
                    </label>
                    <p>{employee.documentNumber}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">
                      Fecha de Nacimiento
                    </label>
                    <p>{formatDateFH(employee.birthDate)}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">Género</label>
                    <p>{employee.gender || "-"}</p>
                  </div>
                  <div className="col-12">
                    <label className="font-bold block mb-2">Dirección</label>
                    <p>{employee.address}</p>
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
                <div className="grid gap-3">
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">
                      Código de Empleado
                    </label>
                    <p>{employee?.employeeCode}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">
                      Fecha de Incorporación
                    </label>
                    <p>{formatDateFH(jobInfo.effectiveDate)}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">Posición</label>
                    <p>{positionName}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">Departamento</label>
                    <p>{departmentName}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">
                      Centro de Costo
                    </label>
                    <p>{jobInfo.costCenter || "-"}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">
                      Tipo de Contrato
                    </label>
                    <p>{jobInfo.contractType}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">
                      Jornada Laboral
                    </label>
                    <p>{jobInfo.workShift}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">Supervisor</label>
                    <p>{jobInfo.supervisorId || "-"}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">
                      Frecuencia de Pago
                    </label>
                    <p>{jobInfo.payFrequency}</p>
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
                <div className="grid gap-3">
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">IVSS</label>
                    <p>{employee.ivssNumber || "-"}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">RIF</label>
                    <p>{employee.rifNumber || "-"}</p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">
                      ¿Afiliado a FAOV?
                    </label>
                    <p>
                      <span
                        className={classNames(
                          "surface-section px-2 py-1 border-round text-sm",
                          employee.isFaovEnrolled
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700",
                        )}
                      >
                        {employee.isFaovEnrolled ? "Sí" : "No"}
                      </span>
                    </p>
                  </div>
                  <div className="col-12 md:col-6">
                    <label className="font-bold block mb-2">
                      ¿Afiliado a INCES?
                    </label>
                    <p>
                      <span
                        className={classNames(
                          "surface-section px-2 py-1 border-round text-sm",
                          employee.isIncesEnrolled
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700",
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
