"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { Dialog } from "primereact/dialog";
import { useRouter } from "next/navigation";
import { classNames } from "primereact/utils";

import {
  createEmployeeSchema,
  CreateEmployeeFormData,
} from "@/modules/nomina/employees/schemas/employee.schema";
import {
  createEmployee,
  updateEmployee,
} from "@/modules/nomina/employees/services/employee.service";
import {
  Employee,
  UpdateEmployeeRequest,
} from "@/modules/nomina/employees/interfaces/employee.interface";
import { handleFormError } from "@/utils/errorHandlers";

import PersonalDataSection from "./EmployeeFormSections/PersonalDataSection";
import LaboralDataSection from "./EmployeeFormSections/LaboralDataSection";
import SocialSecuritySection from "./EmployeeFormSections/SocialSecuritySection";
import BankingDataSection from "./EmployeeFormSections/BankingDataSection";
import AdditionalDataSection from "./EmployeeFormSections/AdditionalDataSection";

interface EmployeeFormProps {
  employee?: Employee | null;
  isNew?: boolean;
  // Modal mode props (when used inside a Dialog)
  onSave?: () => void | Promise<void>;
  formId?: string;
  onSubmittingChange?: (isSubmitting: boolean) => void;
  toast?: React.RefObject<Toast>;
}

export default function EmployeeForm({
  employee,
  isNew = true,
  onSave,
  formId,
  onSubmittingChange,
  toast: externalToast,
}: EmployeeFormProps) {
  const internalToast = useRef<Toast>(null);
  const toast = externalToast || internalToast;
  const router = useRouter();
  const isModalMode = !!onSave; // Modal mode if onSave is provided
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showDialog, setShowDialog] = useState(!isModalMode); // Only show dialog in standalone mode

  const form = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    mode: "onBlur",
    defaultValues: {
      // Personal
      firstName: employee?.firstName || "",
      middleName: employee?.middleName || "",
      lastName: employee?.lastName || "",
      secondLastName: employee?.secondLastName || "",
      documentType: (employee?.documentType as any) || "V",
      documentNumber: employee?.documentNumber || "",
      birthDate: employee?.birthDate
        ? new Date(employee.birthDate).toISOString().split("T")[0]
        : "",
      gender: (employee?.gender as any) || "M",
      maritalStatus: employee?.maritalStatus || "",
      nationality: employee?.nationality || "",
      phone: employee?.phone || "",
      email: employee?.email || "",
      address: employee?.address || "",
      birthPlace: employee?.birthPlace || "",
      dependents: employee?.dependents || 0,

      // Laboral
      employeeCode: employee?.employeeCode || "",
      hireDate: employee?.hireDate
        ? new Date(employee.hireDate).toISOString().split("T")[0]
        : "",
      positionId: "",
      departmentId: "",
      costCenter: "",
      contractType: "INDEFINITE",
      workShift: "FULL_TIME",
      payFrequency: "MONTHLY",
      supervisorId: "",
      salaryAmount: 0,
      currency: "VES",

      // Social Security
      ivssNumber: employee?.ivssNumber || "",
      rifNumber: employee?.rifNumber || "",
      isFaovEnrolled: employee?.isFaovEnrolled || false,
      isIncesEnrolled: employee?.isIncesEnrolled || false,

      // Banking
      bankId: "",
      accountType: "SAVINGS",
      accountNumber: "",

      // Additional
      emergencyContactName: employee?.emergencyContactName || "",
      emergencyContactPhone: employee?.emergencyContactPhone || "",
      observations: employee?.observations || "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (data: CreateEmployeeFormData) => {
    try {
      setIsSubmitting(true);
      if (onSubmittingChange) onSubmittingChange(true);

      if (employee?.id) {
        await updateEmployee(employee.id, {
          ...data,
          id: employee.id,
        } as unknown as UpdateEmployeeRequest);
      } else {
        await createEmployee(data);
      }

      // If in modal mode, call onSave callback; otherwise redirect
      if (isModalMode && onSave) {
        await onSave();
      } else {
        setTimeout(() => {
          router.push("/empresa/nomina/empleados");
        }, 2000);
      }
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setIsSubmitting(false);
      if (onSubmittingChange) onSubmittingChange(false);
    }
  };

  const handleClose = () => {
    if (isModalMode) {
      // In modal mode, just close (parent dialog will close)
      // This shouldn't happen but provide fallback
      return;
    } else {
      router.push("/empresa/nomina/empleados");
    }
  };

  const tabsHeader = [
    { title: "Datos Personales", icon: "pi-user" },
    { title: "Datos Laborales", icon: "pi-briefcase" },
    { title: "Seguridad Social", icon: "pi-shield" },
    { title: "Datos Bancarios", icon: "pi-money-bill" },
    { title: "Información Adicional", icon: "pi-info-circle" },
  ];

  const currentTab = tabsHeader[activeTab];
  const hasErrors = Object.keys(errors).length > 0;

  // Form content (shared between modal and standalone modes)
  const formContent = (
    <form
      id={formId}
      className="p-fluid"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }}
    >
      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
      >
        {/* Tab 1: Personal Data */}
        <TabPanel header="Datos Personales" leftIcon="pi pi-user">
          <div className="p-3">
            <PersonalDataSection form={form} />
          </div>
        </TabPanel>

        {/* Tab 2: Laboral Data */}
        <TabPanel header="Datos Laborales" leftIcon="pi pi-briefcase">
          <div className="p-3">
            <LaboralDataSection form={form} />
          </div>
        </TabPanel>

        {/* Tab 3: Social Security */}
        <TabPanel header="Seguridad Social" leftIcon="pi pi-shield">
          <div className="p-3">
            <SocialSecuritySection form={form} />
          </div>
        </TabPanel>

        {/* Tab 4: Banking */}
        <TabPanel header="Datos Bancarios" leftIcon="pi pi-money-bill">
          <div className="p-3">
            <BankingDataSection form={form} />
          </div>
        </TabPanel>

        {/* Tab 5: Additional */}
        <TabPanel header="Información Adicional" leftIcon="pi pi-info-circle">
          <div className="p-3">
            <AdditionalDataSection form={form} />
          </div>
        </TabPanel>
      </TabView>

      {hasErrors && (
        <div className="mt-4 p-4 surface-section border-1 border-red-200 border-round bg-red-50">
          <h4 className="text-red-700 m-0 mb-2">
            ⚠️ Errores de validación encontrados
          </h4>
          <p className="text-sm text-red-600 m-0">
            Por favor revisa los campos requeridos antes de guardar.
          </p>
        </div>
      )}
    </form>
  );

  const tabNavigationButtons = (
    <div className="flex gap-2">
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
        onClick={() => setActiveTab(Math.min(4, activeTab + 1))}
        disabled={activeTab === 4}
        className="ml-2"
      />
    </div>
  );

  const actionButtons = (
    <div className="flex gap-2">
      <Button label="Cancelar" severity="secondary" onClick={handleClose} />
      <Button
        label={isNew ? "Crear" : "Actualizar"}
        loading={isSubmitting}
        onClick={() => handleSubmit(onSubmit)()}
        className="ml-2"
      />
    </div>
  );

  return (
    <>
      {!isModalMode && <Toast ref={internalToast} />}

      {isModalMode ? (
        // Modal mode: render form only (Dialog managed by parent)
        formContent
      ) : (
        // Standalone mode: render with Dialog
        <Dialog
          visible={showDialog}
          onHide={handleClose}
          header={
            <div className="flex align-items-center gap-2">
              <i className={classNames("pi", `pi-${currentTab.icon}`)} />
              <span>
                {isNew ? "Crear Nuevo Empleado" : "Editar Empleado"} —{" "}
                {currentTab.title}
              </span>
            </div>
          }
          modal
          maximizable
          style={{ width: "90vw", height: "90vh" }}
          onMaximize={(e) => {
            e.maximized
              ? (document.documentElement.style.overflow = "hidden")
              : (document.documentElement.style.overflow = "auto");
          }}
          footer={
            <div className="flex gap-2 justify-content-between">
              <div>{tabNavigationButtons}</div>
              <div>{actionButtons}</div>
            </div>
          }
        >
          {formContent}
        </Dialog>
      )}
    </>
  );
}
