import NotFound from "@/app/not-found";
import UsersListView from "./UsersListView";
import { Permission, User } from "@/lib/definitions";
import { fetchUsers, findUserById } from "@/app/actions/user-actions";
import UsersFormView from "./UsersFormView";
import { fetchPermissions } from "@/app/actions/permission-actions";
import { Suspense } from "react";
import { Spinner } from "react-bootstrap";

async function UsersMainView({
  viewType,
  id,
  profile,
}: {
  viewType: string;
  id: string;
  profile: string;
}) {
  let users: User[] = [];
  let user: User | null = null;
  let permissions: Permission[] = [];

  let getUsers: User[] = [];

  if (id && id !== "null") {
    // Ejecutamos ambos fetches en paralelo
    [user] = await Promise.all([findUserById({ id: Number(id) })]);
  }

  [users, permissions] = await Promise.all([fetchUsers(), fetchPermissions()]);

  getUsers = users.filter((u) => u.role !== "EMPLOYEE");

  if (viewType === "list") {
    return <UsersListView users={getUsers} />;
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<Spinner size="sm" animation="border" />}>
        <UsersFormView
          user={user}
          id={Number(id)}
          perms={permissions || []}
          profile={profile}
        />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default UsersMainView;
