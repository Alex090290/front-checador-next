import NotFound from "@/app/not-found";
import PermissionsFormView from "./PermissionsFormView";
import PermissionsListView from "./PermissionsListView";
import { Employee, IPermissionRequest } from "@/lib/definitions";
import {
  fetchPermissionsByEmployee,
  fetchPermissionsById,
} from "@/app/actions/permissions-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";

async function PermissionsMainView({
  id,
  viewType,
}: {
  id: string;
  viewType: string;
}) {
  let permissions: IPermissionRequest[] = [];
  let permission: IPermissionRequest | null = null;
  let employees: Employee[] = [];

  if (id && id !== "null") {
    permission = await fetchPermissionsById({ id });
  }

  [permissions, employees] = await Promise.all([
    fetchPermissionsByEmployee(),
    fetchEmployees(),
  ]);

  if (viewType === "list") {
    return <PermissionsListView permissions={permissions.reverse()} />;
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
