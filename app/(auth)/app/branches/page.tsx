import Loading from "@/components/templates/Loaging";
import { lazy, Suspense } from "react";

const BranchesMainView = lazy(() => import("./BranchesMainView"));

async function PageBranches({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: ViewType, id } = await searchParams;

  return (
    <Suspense fallback={<Loading />}>
      <BranchesMainView viewType={ViewType} id={Number(id)} />
    </Suspense>
  );
}

export default PageBranches;
