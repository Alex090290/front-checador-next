import Loading from "@/components/templates/Loaging";
import { lazy, Suspense } from "react";

const UsersMainView = lazy(() => import("./views/UsersMainView"));

async function PageUsers({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;

  return (
    <Suspense fallback={<Loading />}>
      <UsersMainView viewType={viewType} id={id} />
    </Suspense>
  );
}

export default PageUsers;
