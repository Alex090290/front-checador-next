import { Suspense } from "react";
import Loading from "@/components/templates/Loaging";
import ListAllOverTime from "./views/ListAllOverTime";

type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
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

  return (
    <Suspense fallback={<Loading />}>
      <ListAllOverTime id={id} limit={limit} page={page} />
    </Suspense>
  );
}

export default PageOverTime;
