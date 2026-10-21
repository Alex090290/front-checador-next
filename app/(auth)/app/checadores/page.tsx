export const dynamic = "force-dynamic";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListChecadores from "./views/ListChecadores";


type SearchParams = {
  page?: string;
  limit?: string;
  search?: string;
  branch?: string;
  status?: string;
  checkMethods?: string;
};


async function PageChecadores({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <ListChecadores
        page={params?.page ?? "1"}
        limit={params?.limit ?? "50"}
        search={params?.search ?? ""}
        branch={params?.branch ?? ""}
        status={params?.status ?? ""}
        checkMethods={params?.checkMethods ?? ""}
      />
    </Suspense>
  );
}

export default PageChecadores;
