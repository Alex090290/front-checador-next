import LoadingPage from "@/app/LoadingPage";
import { lazy, Suspense } from "react";

const EventosMainView = lazy(() => import("./views/EventosMainView"));

async function PageEventos({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;
  return (
    <Suspense fallback={<LoadingPage />}>
      <EventosMainView viewType={viewType} id={id} />
    </Suspense>
  );
}

export default PageEventos;
