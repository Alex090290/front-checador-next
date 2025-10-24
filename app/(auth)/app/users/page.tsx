import LoadingPage from "@/app/LoadingPage";
import { lazy, Suspense } from "react";

const UsersMainView = lazy(() => import("./views/UsersMainView"));

async function PageUsers({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id, profile } = await searchParams;

  return (
    <Suspense fallback={<LoadingPage />}>
      <UsersMainView viewType={viewType} id={id} profile={profile} />
    </Suspense>
  );
}

export default PageUsers;
