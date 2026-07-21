import { fetchPermissions } from "@/app/actions/permission-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import { fetchUsersPages } from "@/app/actions/user-actions";
import UserTableClient from "@/components/users/UsersTableList";
import UserInfoOne from "./infoOneUser";

export default async function ListAllUsers({
  id,
  page = "1",
  limit = "20",
  search = "",
}: {
  id: string;
  page?: string;
  limit?: string;
  search?: string;
}) {
  if (id && id !== "null") {
    return (
      <UserInfoOne id={id} />
    );
  }

  const pageParse = Math.max(Number(page || "1") || 1, 1);
  const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 100);
  
  const [getUsers, permissions, employees] = await Promise.all([
    fetchUsersPages({ page: pageParse, limit: limitParse, search: search }),
    fetchPermissions(),
    fetchEmployees(),
  ]);
  
  return (
    <UserTableClient
      users={getUsers.data}
      total={getUsers.total}
      page={pageParse}
      limit={limitParse}
      perms={permissions ?? []}
      employees={employees.data ?? []}
      search={search}
    />
  );
}