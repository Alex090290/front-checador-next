import NotFound from "@/app/not-found";
import CatalogListView from "./EmployeeListView";
import EmployeeFormView from "./EmployeeFormView";
import { Branch, Department, Employee, IPeriod } from "@/lib/definitions";
import {
  fetchEmployees,
  findEmployeeById,
} from "@/app/actions/employee-actions";
import { fetchDepartments } from "@/app/actions/departments-actions";
import { fetchBranches } from "@/app/actions/branches-actionst";
import { fetchDocumentTypes } from "@/app/actions/documents-actions";

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
  let documents: IPeriod[] = [];

  if (id && !isNaN(id)) {
    [employee, documents] = await Promise.all([
      findEmployeeById({ id }),
      fetchDocumentTypes({ id }),
    ]);
  }

  [employees, departments, branches] = await Promise.all([
    fetchEmployees(),
    fetchDepartments(),
    fetchBranches(),
  ]);

  if (viewType === "list") {
    return <CatalogListView employees={employees} />;
  } else if (viewType === "form") {
    return (
      <EmployeeFormView
        employee={employee}
        id={id}
        departments={departments || []}
        branches={branches || []}
        employees={employees || []}
        documents={documents || []}
      />
    );
  } else {
    return <NotFound />;
  }
}

export default EmployeeMainView;
