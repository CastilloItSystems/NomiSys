"use client";
import PayrollRunEditor from "@/modules/nomina/payroll-runs/components/PayrollRunEditor";

export default function PayrollRunEditorPage({
  params,
}: {
  params: { id: string };
}) {
  return <PayrollRunEditor runId={params.id} />;
}
