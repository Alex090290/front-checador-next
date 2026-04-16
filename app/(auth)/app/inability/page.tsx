import Loading from "@/components/LoadingSpinner";
import React, { lazy, Suspense } from "react";
import ListAllInability from "./views/ListAllInabilities";

type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
};


async function PageInahibility({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  // const { view_type: viewType, id } = await searchParams;
  const id = searchParams?.id ?? "null";

  const page = searchParams?.page ?? "1";
  const limit = searchParams?.limit ?? "20";

  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
        <ListAllInability id={id} limit={limit} page={page} />
    </Suspense>
  );
}

export default PageInahibility;
