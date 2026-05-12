import Loading from "@/components/LoadingSpinner";
import React, { Suspense } from "react";
import PermissionsMainView from "./views/PermissionsMainView";


type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
};

async function PagePermissions({
  searchParams,
}: {
  searchParams?: SearchParams;
}) { 
  const id = searchParams?.id ?? "null";

  const page = searchParams?.page ?? "1";
  const limit = searchParams?.limit ?? "20";
    
  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      {/* <PermissionsMainView viewType={viewType} id={id} /> */}
      <PermissionsMainView id={id} limit={limit} page={page}  />
    </Suspense>
  );
}

export default PagePermissions;
