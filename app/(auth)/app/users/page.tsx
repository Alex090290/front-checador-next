import LoadingPage from "@/app/LoadingPage";
import { lazy, Suspense } from "react";

const UsersMainView = lazy(() => import("./views/UsersMainView"));

async function PageUsers({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;

  return (
    <Suspense fallback={<LoadingPage />}>
      <UsersMainView viewType={viewType} id={id} />
    </Suspense>
  );
}

export default PageUsers;
