import LoadingPage from "@/app/LoadingPage";
import React, { lazy, Suspense } from "react";

const PermissionsMainView = lazy(() => import("./views/PermissionsMainView"));

async function PagePermissions({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;
  return (
    <Suspense fallback={<LoadingPage />}>
      <PermissionsMainView viewType={viewType} id={id} />
    </Suspense>
  );
}

export default PagePermissions;
