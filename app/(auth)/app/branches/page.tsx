import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListAllBranches from "./ListAllBranches";

type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
};

async function PageBranches({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {

  const id = searchParams?.id ?? "null";

  const page = searchParams?.page ?? "1";
  const limit = searchParams?.limit ?? "20";
  
  return <>
      <Suspense fallback={<Loading message="Cargando datos..." />}>
        <ListAllBranches id={id} limit={limit} page={page} />
      </Suspense>
  </>
}

export default PageBranches;
