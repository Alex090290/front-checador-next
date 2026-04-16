import { fetchEmployees } from "@/app/actions/employee-actions";
import CreatePermissionComponent from "@/components/Permissions/CreatePermission";

export const dynamic = "force-dynamic";

export default async function CreatePermissionPage(){

    const employees = await fetchEmployees({ page: 1, limit: 500 });

  return <>
    <CreatePermissionComponent employees={employees.data} />
  </>
}