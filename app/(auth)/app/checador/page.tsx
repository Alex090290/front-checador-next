import Loading from "@/components/templates/Loaging";
import { lazy, Suspense } from "react";

const ChecadorMainView = lazy(() => import("./views/ChecadorMainView"));

async function PageChecador({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType } = await searchParams;

  return (
    <Suspense fallback={<Loading />}>
      <ChecadorMainView viewType={viewType} />
    </Suspense>
  );
}

export default PageChecador;
