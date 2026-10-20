import { findUserById, getUserData } from "@/app/actions/user-actions";
import { storeAction } from "@/app/actions/storeActions";
import Loading from "@/components/LoadingSpinner";
import UserProfileView from "@/components/users/Profile";
import EmployeeProfileView from "@/components/users/EmployeeProfile";
import { User } from "@/lib/definitions";
import { Suspense } from "react";
import ProfileError from "@/components/users/profileMessageError";

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

  // Sin /me no se sabe si la sesión es de empleado o de usuario: antes se caía a GET /user (que pide
  // "listar_usuarios") y salía "Perfil no encontrado" aunque el perfil sí existe. Se muestra el motivo real.
  if (!me.success || !meData) {
    console.log("[PROFILE] No se pudo consultar /me:", me.message);
    return (
      <ProfileError
        title="No se pudo cargar tu perfil"
        message={`${me.message || "No hubo respuesta del servidor"}. Recarga la página o vuelve a iniciar sesión.`}
      />
    );
  }

  // El perfil se decide únicamente con sessionType de /me
  if (meData?.sessionType === "employee") {
    return (
      <Suspense fallback={<Loading message="Cargando datos..." />}>
        <EmployeeProfileView me={meData} />
      </Suspense>
    );
  }

  // El perfil propio sale de /me: GET /user exige el permiso "listar_usuarios" y sin él el perfil salía vacío
  const isOwnProfile = id === "null" || Number(id) === Number(meData.id);
  const user = isOwnProfile ? meData : await findUserById({ id: Number(id) });

  return (
    <>
      <Suspense fallback={<Loading message="Cargando datos..." />}>
        <UserProfileView user={user} me={meData} />
      </Suspense>
    </>
  )
}
