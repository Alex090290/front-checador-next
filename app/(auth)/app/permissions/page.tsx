import Loading from "@/components/LoadingSpinner";
import React, { Suspense } from "react";
import PermissionsMainView from "./views/PermissionsMainView";


type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
  search?: string;
  dateInit?: string;
  dateEnd?: string;
};

async function PagePermissions({
  searchParams,
}: {
  searchParams?: SearchParams;
}) { 
  const id = searchParams?.id ?? "null";

  const page = searchParams?.page ?? "1";
  const limit = searchParams?.limit ?? "20";
  const search = searchParams?.search ?? "";
  const dateInit = searchParams?.dateInit ?? "";
  const dateEnd = searchParams?.dateEnd ?? "";
    
  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      {/* <PermissionsMainView viewType={viewType} id={id} /> */}
      <PermissionsMainView id={id} limit={limit} page={page} search={search} dateInit={dateInit} dateEnd={dateEnd}  />
    </Suspense>
  );
}

export default PagePermissions;
