import NotFound from "@/app/not-found";
import CatalogListView from "./EmployeeListView";
import EmployeeFormView from "./EmployeeFormView";
import { Branch, Department, Employee } from "@/lib/definitions";
import {
  fetchEmployees,
  findEmployeeById,
} from "@/app/actions/employee-actions";
import { fetchDepartments } from "@/app/actions/departments-actions";
import { fetchBranches } from "@/app/actions/branches-actionst";

async function EmployeeMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: number;
}) {
  let employee: Employee | null = null;
  let employees: Employee[] = [];
  let departments: Department[] = [];
  let branches: Branch[] = [];

  if (id && !isNaN(id)) {
    employee = await findEmployeeById({ id });
  }

  employees = await fetchEmployees();
  departments = await fetchDepartments();
  branches = await fetchBranches();

  if (viewType === "list") {
    return <CatalogListView employees={employees} />;
  } else if (viewType === "form") {
    return (
      <EmployeeFormView
        employee={employee}
        id={id}
        departments={departments || []}
        branches={branches || []}
      />
    );
  } else {
    return <NotFound />;
  }
}

export default EmployeeMainView;
