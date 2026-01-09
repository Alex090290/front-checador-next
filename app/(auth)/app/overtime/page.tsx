import LoadingPage from "@/app/LoadingPage";
import React, { lazy, Suspense } from "react";

const OvertimeMainView = lazy(() => import("./views/OvertimeMainView"));

async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;

  return (
    <Suspense fallback={<LoadingPage />}>
      <OvertimeMainView id={id} viewType={viewType} />
    </Suspense>
  );
}

export default page;
