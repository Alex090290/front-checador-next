export const dynamic = "force-dynamic";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ViewConfig from "./views/viewConfig";

async function PageConfigSystem(){
  return(
    <Suspense fallback={<Loading message="Cargando datos.."/>}>
      <ViewConfig />
    </Suspense>
  )
}
export default PageConfigSystem;