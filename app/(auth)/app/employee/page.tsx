import LoadingPage from "@/app/LoadingPage";
import { lazy, Suspense } from "react";

const EmployeeMainView = lazy(() => import("./views/EmployeeMainView"));

async function PageEmployee({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;

  return (
    <Suspense fallback={<LoadingPage />}>
      <EmployeeMainView viewType={viewType} id={Number(id)} />
    </Suspense>
  );
}

export default PageEmployee;
