import { findUserById, getUserData } from "@/app/actions/user-actions";
import { storeAction } from "@/app/actions/storeActions";
import Loading from "@/components/LoadingSpinner";
import UserProfileView from "@/components/users/Profile";
import EmployeeProfileView from "@/components/users/EmployeeProfile";
import { User } from "@/lib/definitions";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

type SearchParams = {
  id?: string;
};


export default async function UserProfilePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const id = params?.id ?? "null";

  const { apiToken } = await storeAction();

  const me = await getUserData({ apiToken: apiToken ?? "" });

  const meData = (me.data as unknown as User) ?? null;

  // El perfil se decide únicamente con sessionType de /me
  if (meData?.sessionType === "employee") {
    return (
      <Suspense fallback={<Loading message="Cargando datos..." />}>
        <EmployeeProfileView me={meData} />
      </Suspense>
    );
  }

  // El perfil propio sale de /me: GET /user exige el permiso "listar_usuarios" y sin él el perfil salía vacío
  const isOwnProfile = !!meData && (id === "null" || Number(id) === Number(meData.id));
  const user = isOwnProfile ? meData : await findUserById({ id: Number(id) });

  return (
    <>
      <Suspense fallback={<Loading message="Cargando datos..." />}>
        <UserProfileView user={user} me={meData} />
      </Suspense>
    </>
  )
}
