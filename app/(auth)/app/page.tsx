import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import DashboardView from "./dashboard/dashboardView";
import { auth } from "@/lib/auth";
import DashboardViewE from "./dashboard/dashboarEmployees";

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

  const isEmployee = [roles?.isApproverDoh, roles?.isApproverLeaders, roles?.isDoh, roles?.isExtra, roles?.isLeader].every((value) => value === false);
  const isLeader = [roles?.isApproverDoh, roles?.isApproverLeaders, roles?.isDoh, roles?.isExtra].every((value) => value === false);


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
