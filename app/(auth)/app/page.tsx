import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import DashboardView from "./dashboard/dashboardView";
import { auth } from "@/lib/auth";
import DashboardViewE from "./dashboard/dashboarEmployees";
import { getUserData } from "@/app/actions/user-actions";
import { User } from "@/lib/definitions";

type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
  search?: string;
  idPeriod?: string;
  year?: string;
  type?: string;
};

async function PageApp({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;

}) {
  const session = await auth();
  const roles = session?.user?.roles;

  // El dashboard se decide con sessionType de /me (igual que el perfil): un usuario del sistema enlazado a un
  // empleado trae roles de empleado, pero debe ver el dashboard de admin. Solo las sesiones de empleado ven el suyo
  const me = await getUserData({ apiToken: session?.user?.apiToken ?? "" });
  const sessionType = me.success ? (me.data as unknown as User)?.sessionType : undefined;

  // Respaldo por roles solo si /me no regresó sessionType
  const isEmployee = sessionType
    ? sessionType === "employee"
    : [roles?.isApproverDoh, roles?.isApproverLeaders, roles?.isDoh, roles?.isExtra, roles?.isLeader].every((value) => value === false);
  const isLeader = sessionType
    ? false
    : [roles?.isApproverDoh, roles?.isApproverLeaders, roles?.isDoh, roles?.isExtra].every((value) => value === false);


  if (!isEmployee && !isLeader) {
    return (
      <Suspense fallback={<Loading message="Cargando datos..." />}>
        <DashboardView />
      </Suspense>
    );
  } else if (isEmployee || isLeader) {
    const params = await searchParams;

  
    const idPeriod = params?.idPeriod ?? ""
    const year = params?.year ?? ""


    return (
      <Suspense fallback={<Loading message="Cargando datos..." />}>
        <DashboardViewE
          idPeriod={idPeriod}
          year={year}
        />
      </Suspense>
    )
  }
}

export default PageApp;
