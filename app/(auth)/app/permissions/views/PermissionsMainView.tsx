import NotFound from "@/app/not-found";
import PermissionsFormView from "./PermissionsFormView";
import PermissionsListView from "./PermissionsListView";
import { Employee, IPermissionRequest } from "@/lib/definitions";
import {
  fetchPermissionsByEmployee,
  fetchPermissionsById,
} from "@/app/actions/permissions-actions";
import {
  fetchEmployees,
  findEmployeeById,
} from "@/app/actions/employee-actions";
import { auth } from "@/lib/auth";

async function PermissionsMainView({
  id,
  viewType,
}: {
  id: string;
  viewType: string;
}) {
  const session = await auth();

  let permissions: IPermissionRequest[] = [];
  let permission: IPermissionRequest | null = null;
  let employees: Employee[] = [];

  if (id && id !== "null") {
    permission = await fetchPermissionsById({ id });
  }

  [permissions, employees] = await Promise.all([
    fetchPermissionsByEmployee(),
    fetchEmployees(),
    findEmployeeById({ id: Number(session?.user?.id) }),
  ]);

  if (viewType === "list") {
    return <PermissionsListView permissions={permissions} />;
  } else if (viewType === "form") {
    return (
      <PermissionsFormView
        id={id}
        permission={permission}
        employees={employees}
      />
    );
  } else {
    return <NotFound />;
  }
}

export default PermissionsMainView;
