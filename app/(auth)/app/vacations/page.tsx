import LoadingPage from "@/app/LoadingPage";
import { lazy, Suspense } from "react";

const VacationsMainView = lazy(() => import("./views/VacationsMainView"));

async function PageVacations({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;
  return (
    <Suspense fallback={<LoadingPage />}>
      <VacationsMainView viewType={viewType} id={id} />
    </Suspense>
  );
}

export default PageVacations;
