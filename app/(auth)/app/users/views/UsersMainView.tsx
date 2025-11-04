import NotFound from "@/app/not-found";
import UsersListView from "./UsersListView";
import { Employee, Permission, User } from "@/lib/definitions";
import { fetchUsers, findUserById } from "@/app/actions/user-actions";
import UsersFormView from "./UsersFormView";
import { fetchPermissions } from "@/app/actions/permission-actions";
import { Suspense } from "react";
import { Spinner } from "react-bootstrap";
import { fetchEmployees } from "@/app/actions/employee-actions";

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
  let employees: Employee[] = [];

  let getUsers: User[] = [];

  if (id && id !== "null") {
    user = await findUserById({ id: Number(id) });
  }

  [users, permissions, employees] = await Promise.all([
    fetchUsers(),
    fetchPermissions(),
    fetchEmployees(),
  ]);

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
          employees={employees}
        />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default UsersMainView;
