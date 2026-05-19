"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import FormActionButtons from "@/shared/components/FormActionButtons";
import {
  Attendance,
  AttendanceStatus,
  CreateAttendanceRequest,
} from "../interfaces/attendance.interface";
import {
  createAttendance,
  updateAttendance,
} from "../services/attendance.service";

const STATUS_OPTIONS: { label: string; value: AttendanceStatus }[] = [
  { label: "Presente", value: "Presente" },
  { label: "Ausente", value: "Ausente" },
  { label: "Tardanza", value: "Tardanza" },
  { label: "Permiso", value: "Permiso" },
  { label: "Vacaciones", value: "Vacaciones" },
  { label: "Feriado", value: "Feriado" },
];

interface Props {
  attendance?: Attendance | null;
  onSave: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
}

export default function AttendanceForm({
  attendance,
  onSave,
  onCancel,
  isSubmitting,
  setIsSubmitting,
}: Props) {
  const { control, handleSubmit, reset } = useForm<any>({
    defaultValues: {
      employeeId: "",
      date: null,
      status: "Presente",
      checkIn: null,
      checkOut: null,
      notes: "",
    },
  });

  useEffect(() => {
    reset(
      attendance
        ? {
            employeeId: attendance.employeeId,
            date: new Date(attendance.date),
            status: attendance.status,
            checkIn: attendance.checkIn ? new Date(attendance.checkIn) : null,
            checkOut: attendance.checkOut
              ? new Date(attendance.checkOut)
              : null,
            notes: attendance.notes ?? "",
          }
        : {
            employeeId: "",
            date: null,
            status: "Presente",
            checkIn: null,
            checkOut: null,
            notes: "",
          },
    );
  }, [attendance, reset]);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const fmt = (d: Date | null) => (d ? d.toISOString() : undefined);
      const fmtDate = (d: Date | null) =>
        d ? d.toISOString().split("T")[0] : "";
      const payload: CreateAttendanceRequest = {
        employeeId: data.employeeId,
        date: fmtDate(data.date),
        status: data.status,
        checkIn: fmt(data.checkIn),
        checkOut: fmt(data.checkOut),
        notes: data.notes,
      };
      if (attendance?.id) await updateAttendance(attendance.id, payload);
      else await createAttendance(payload);
      onSave();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column gap-3">
      <div className="field">
        <label>ID Empleado *</label>
        <Controller
          name="employeeId"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              className="w-full"
              disabled={!!attendance?.id}
            />
          )}
        />
      </div>
      <div className="grid">
        <div className="col-6 field">
          <label>Fecha *</label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Calendar
                {...field}
                dateFormat="yy-mm-dd"
                showIcon
                className="w-full"
              />
            )}
          />
        </div>
        <div className="col-6 field">
          <label>Estado *</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                options={STATUS_OPTIONS}
                className="w-full"
              />
            )}
          />
        </div>
      </div>
      <div className="grid">
        <div className="col-6 field">
          <label>Entrada</label>
          <Controller
            name="checkIn"
            control={control}
            render={({ field }) => (
              <Calendar {...field} showTime showIcon className="w-full" />
            )}
          />
        </div>
        <div className="col-6 field">
          <label>Salida</label>
          <Controller
            name="checkOut"
            control={control}
            render={({ field }) => (
              <Calendar {...field} showTime showIcon className="w-full" />
            )}
          />
        </div>
      </div>
      <div className="field">
        <label>Notas</label>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <InputTextarea {...field} className="w-full" rows={2} />
          )}
        />
      </div>
      <FormActionButtons
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitLabel={attendance?.id ? "Actualizar" : "Registrar"}
      />
    </form>
  );
}
