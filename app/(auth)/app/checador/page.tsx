import Loading from "@/components/templates/Loaging";
import { lazy, Suspense } from "react";

const ChecadorMainView = lazy(() => import("./views/ChecadorMainView"));

async function PageChecador() {
  return (
    <Suspense fallback={<Loading />}>
      <ChecadorMainView viewType="form" />
    </Suspense>
  );
}

export default PageChecador;
