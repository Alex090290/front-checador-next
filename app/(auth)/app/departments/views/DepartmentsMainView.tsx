import NotFound from "@/app/not-found";
import DepartmentsFormView from "./DepartmentsFormView";
import DepartmentsListView from "./DepartmentsListView";
import { Department, Employee } from "@/lib/definitions";
import {
  fetchDepartments,
  findDepartmentById,
} from "@/app/actions/departments-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";

async function DepartmentsMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: number;
}) {
  let department: Department | null = null;

  if (id && !isNaN(id)) {
    department = await findDepartmentById({ id });
  }

  const [departments, employees] = await Promise.all([
    fetchDepartments(),
    fetchEmployees({ page: 1, limit: 500 }),
  ]);

  if (viewType === "list") {
    return <DepartmentsListView deparments={departments || []} />;
  } else if (viewType === "form") {
    return (
      <DepartmentsFormView
        department={department}
        id={id}
        employees={employees.data || []}
      />
    );
  } else {
    return <NotFound />;
  }
}

export default DepartmentsMainView;
