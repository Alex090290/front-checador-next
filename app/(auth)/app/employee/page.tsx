import Loading from "@/components/templates/Loaging";
import { lazy, Suspense } from "react";

const EmployeeMainView = lazy(() => import("./views/EmployeeMainView"));

async function PageEmployee({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;

  return (
    <Suspense fallback={<Loading />}>
      <EmployeeMainView viewType={viewType} id={id} />
    </Suspense>
  );
}

export default PageEmployee;
