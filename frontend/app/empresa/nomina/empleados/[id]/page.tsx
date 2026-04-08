"use client";

import { Page } from "@/types";
import EmployeeExpedient from "@/modules/nomina/employees/components/EmployeeExpedient";

const EmployeeExpedientPage: Page = ({
  params,
}: {
  params: { id: string };
}) => {
  return <EmployeeExpedient employeeId={params.id} />;
};

export default EmployeeExpedientPage;
