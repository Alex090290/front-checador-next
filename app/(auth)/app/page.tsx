import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import DashboardView from "./dashboard/dashboardView";
import { auth } from "@/lib/auth";

async function PageApp() {
  const session = await auth();
  const roles = session?.user?.roles;
  const role = session?.user?.role


  // ID del empleado con sesión activa

  const isEmployee = [roles?.isApproverDoh, roles?.isApproverLeaders, roles?.isDoh, roles?.isExtra, roles?.isLeader].every((value) => value === false);

switch(isEmployee){
  case (!isEmployee ): 
    return (
      <Suspense fallback={<Loading message="Cargando datos..." />}>
        <DashboardView />
      </Suspense>
    );
   case (String(role).includes('EMPLOYEE') && isEmployee === true): 
    return (
      <h1> ES EMPLEADO </h1>
    )
   case (['EMPLOYEE', 'LEADER'].includes(String(role)) && !isEmployee):      
    return (
      <h1> ES LIDER</h1>
    )
  }
}


export default PageApp;
