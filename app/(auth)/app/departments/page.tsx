import LoadingPage from "@/app/LoadingPage";
import Loading from "@/components/LoadingSpinner";
import { lazy, Suspense } from "react";
import ListAllDepartments from "./views/ListAllDepartments";

const DepartmentsMainView = lazy(() => import("./views/DepartmentsMainView"));

type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
};

async function PageDepartments({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const id = searchParams?.id ?? "null";

  const page = searchParams?.page ?? "1";
  const limit = searchParams?.limit ?? "20";

  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <ListAllDepartments id={id} limit={limit} page={page} />
    </Suspense>
  );
}

export default PageDepartments;
