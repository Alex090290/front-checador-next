import LoadingPage from "@/app/LoadingPage";
import { lazy, Suspense } from "react";

const ChecadorMainView = lazy(() => import("./views/ChecadorMainView"));

async function PageChecador() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ChecadorMainView viewType="form" />
    </Suspense>
  );
}

export default PageChecador;
