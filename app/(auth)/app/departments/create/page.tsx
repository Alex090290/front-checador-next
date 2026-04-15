export const dynamic = "force-dynamic";

import { fetchEmployees } from "@/app/actions/employee-actions";
import CreateDepartmentComponent from "@/components/departments/CreateDepartment";

export default async function CreateDepartmentPage() {
  const employees = await fetchEmployees({ page: 1, limit: 500 });

  return <CreateDepartmentComponent employees={employees.data} />;
}