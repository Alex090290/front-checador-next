export const dynamic = "force-dynamic";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListAllConstancies from "./views/ListAllConstancies";

type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
};

async function PageConstancies({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const id = params?.id ?? "null";

  const page = params?.page ?? "1";
  const limit = params?.limit ?? "20";

  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <ListAllConstancies id={id} limit={limit} page={page} />
    </Suspense>
  );
}

export default PageConstancies;
