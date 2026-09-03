import NotFound from "@/app/not-found";
import CatalogListView from "./EmployeeListView";
import EmployeeFormView from "./EmployeeFormView";
import {
  Employee,
  IPeriod,
} from "@/lib/definitions";
import {
  fetchEmployees,
  findEmployeeById,
} from "@/app/actions/employee-actions";
import { fetchDepartments } from "@/app/actions/departments-actions";
import { fetchBranches } from "@/app/actions/branches-actionst";
import { fetchDocumentTypes } from "@/app/actions/documents-actions";
import { fetchVacationByEmployee } from "@/app/actions/vacations-actions";
import { Vacations } from "@/lib/vactions/interface";

async function EmployeeMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: string;
}) {
  let employee: Employee | null = null;
  let documents: IPeriod[] = [];
  let vacations: Vacations[] = [];

  if (id && id !== "null") {
    [employee, documents, vacations] = await Promise.all([
      findEmployeeById({ id: Number(id) }),
      fetchDocumentTypes({ id: Number(id) }),
      fetchVacationByEmployee({ idEmployee: Number(id) }),
    ]);
  }

  const [employees, departments, branches] = await Promise.all([
    fetchEmployees({ page: 1, limit: 500 }),
    fetchDepartments(),
    fetchBranches(),
  ]);

  if (viewType === "list") {
    return <CatalogListView employees={employees.data} />;
  } else if (viewType === "form") {
    return (
      <EmployeeFormView
        employee={employee}
        id={id}
        departments={departments || []}
        branches={branches || []}
        employees={employees.data || []}
        documents={documents || []}
        vacations={vacations || []}
      />
    );
  } else {
    return <NotFound />;
  }
}

export default EmployeeMainView;
