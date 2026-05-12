export const dynamic = "force-dynamic";
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
  searchParams?: Promise<SearchParams>;
}) {

  const params = await searchParams;

  const id = params?.id ?? "null";

  const page = params?.page ?? "1";
  const limit = params?.limit ?? "20";
  
  return <>
      <Suspense fallback={<Loading message="Cargando datos..." />}>
        <ListAllBranches id={id} limit={limit} page={page} />
      </Suspense>
  </>
}

export default PageBranches;
