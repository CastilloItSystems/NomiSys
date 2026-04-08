"use client";

import { Page } from "@/types";
import EmployeeForm from "@/modules/nomina/employees/components/EmployeeForm";

const CreateEmployeePage: Page = () => {
  return <EmployeeForm isNew />;
};

export default CreateEmployeePage;
