export const dynamic = "force-dynamic";
import { Suspense } from "react";
import ListAllOverTime from "./views/ListAllOverTime";
import Loading from "@/components/LoadingSpinner";

type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
  search?: string;
  dateInit?: string;
  dateEnd?: string;
};


async function PageOverTime({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const id = params?.id ?? "null";
  const page = params?.page ?? "1";
  const limit = params?.limit ?? "20";
  const search = params?.search ?? "";
  const dateInit = params?.dateInit ?? "";
  const dateEnd = params?.dateEnd ?? "";
     
  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <ListAllOverTime id={id} limit={limit} page={page} search={search} dateInit={dateInit} dateEnd={dateEnd}/>
    </Suspense>
  );
}

export default PageOverTime;
