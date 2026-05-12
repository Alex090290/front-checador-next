
import {
  fetchPermissionsByEmployee
} from "@/app/actions/permissions-actions";
import PermissionsTableClient from "@/components/Permissions/PermissionTableClient";
import PermissionInfoOne from "./infoOnePermission";

async function PermissionsMainView({
  id,
  page = "1",
  limit = "20",
}: {
  id: string;
  page?: string;
  limit?: string;
}) {


    if (id && id !== "null") {
      return <PermissionInfoOne id={id} />;
    }

    const pageParse = Math.max(Number(page || "1") || 1, 1);
    const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 100);
  
    const permissionPaged = await fetchPermissionsByEmployee({ page: pageParse, limit: limitParse });
  
    return (
      <PermissionsTableClient
        id={id}
        permissions={permissionPaged.data}
        total={permissionPaged.total}
        page={pageParse}
        limit={limitParse}
      />
    );
}

export default PermissionsMainView;
