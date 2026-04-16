import Loading from "@/components/LoadingSpinner";
import { lazy, Suspense } from "react";
import ListAllEmployees from "./views/ListAllEmployees";


type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
};


async function PageEmployee({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const id = searchParams?.id ?? "null";

  const page = searchParams?.page ?? "1";
  const limit = searchParams?.limit ?? "20";
  
  // const { view_type: viewType, id } = await searchParams;

  return (

    <Suspense fallback={<Loading message="Cargando datos..." />}>
        <ListAllEmployees id={id} limit={limit} page={page} />
    </Suspense>
  );
}

export default PageEmployee;
