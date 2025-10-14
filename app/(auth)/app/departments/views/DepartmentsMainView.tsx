import NotFound from "@/app/not-found";
import DepartmentsFormView from "./DepartmentsFormView";
import DepartmentsListView from "./DepartmentsListView";
import { Department, Employee, User } from "@/lib/definitions";
import {
  fetchDepartments,
  findDepartmentById,
} from "@/app/actions/departments-actions";
import { fetchUsers } from "@/app/actions/user-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";

async function DepartmentsMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: number;
}) {
  let departments: Department[] = [];
  let department: Department | null = null;
  let employees: Employee[] = [];

  if (id && !isNaN(id)) {
    department = await findDepartmentById({ id });
  }

  departments = await fetchDepartments();
  employees = await fetchEmployees();

  if (viewType === "list") {
    return <DepartmentsListView deparments={departments || []} />;
  } else if (viewType === "form") {
    return (
      <DepartmentsFormView
        department={department}
        id={id}
        employees={employees || []}
      />
    );
  } else {
    return <NotFound />;
  }
}

export default DepartmentsMainView;
