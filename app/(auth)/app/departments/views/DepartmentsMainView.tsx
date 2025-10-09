import NotFound from "@/app/not-found";
import DepartmentsFormView from "./DepartmentsFormView";
import DepartmentsListView from "./DepartmentsListView";
import { Department, User } from "@/lib/definitions";
import {
  fetchDepartments,
  findDepartmentById,
} from "@/app/actions/departments-actions";
import { fetchUsers } from "@/app/actions/user-actions";

async function DepartmentsMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: number;
}) {
  let departments: Department[] = [];
  let department: Department | null = null;
  let users: User[] = [];

  if (id && !isNaN(id)) {
    department = await findDepartmentById({ id });
  } else {
    departments = await fetchDepartments();
  }

  users = await fetchUsers();

  if (viewType === "list") {
    return <DepartmentsListView deparments={departments} />;
  } else if (viewType === "form") {
    return (
      <DepartmentsFormView
        department={department}
        id={id}
        usersRelation={users}
      />
    );
  } else {
    return <NotFound />;
  }
}

export default DepartmentsMainView;
