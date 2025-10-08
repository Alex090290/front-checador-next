import NotFound from "@/app/not-found";
import UsersListView from "./UsersListView";
import { Permission, User } from "@/lib/definitions";
import { fetchUsers, findUserById } from "@/app/actions/user-actions";
import UsersFormView from "./UsersFormView";
import { fetchPermissions } from "@/app/actions/permission-actions";

async function UsersMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: string;
}) {
  let users: User[] = [];
  let user: User | null = null;
  let permissions: Permission[] = [];

  let getUsers: User[] = [];

  if (id && id !== "null") {
    // Ejecutamos ambos fetches en paralelo
    [users, user, permissions] = await Promise.all([
      fetchUsers(),
      findUserById({ id: Number(id) }),
      fetchPermissions(),
    ]);
  } else {
    // Solo necesitamos users
    users = await fetchUsers();
    permissions = await fetchPermissions();
  }

  getUsers = users.filter((u) => u.role !== "EMPLOYEE");

  if (viewType === "list") {
    return <UsersListView users={getUsers} />;
  } else if (viewType === "form") {
    return <UsersFormView user={user} id={Number(id)} perms={permissions} />;
  } else {
    return <NotFound />;
  }
}

export default UsersMainView;
