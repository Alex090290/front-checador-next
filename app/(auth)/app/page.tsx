import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import DashboardView from "./dashboard/dashboardView";

function PageApp() {
  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <DashboardView/> 
    </Suspense>
  );
}

export default PageApp;
