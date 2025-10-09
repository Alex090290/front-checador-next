import Loading from "@/components/templates/Loaging";
import { lazy, Suspense } from "react";

const DepartmentsMainView = lazy(() => import("./views/DepartmentsMainView"));

async function PageDepartments({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: ViewType, id } = await searchParams;
  return (
    <Suspense fallback={<Loading />}>
      <DepartmentsMainView viewType={ViewType} id={Number(id)} />
    </Suspense>
  );
}

export default PageDepartments;
