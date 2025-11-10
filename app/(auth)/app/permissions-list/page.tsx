import LoadingPage from "@/app/LoadingPage";
import { Suspense } from "react";
import PermissionsMainView from "./views/PermissionsMainView";

async function PagePermissionsList({
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

export default PagePermissionsList;
