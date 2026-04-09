import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListAllUsers from "./views/ListAllUsers";

type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
};

async function PageUsers({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const id = searchParams?.id ?? "null";

  const page = searchParams?.page ?? "1";
  const limit = searchParams?.limit ?? "20";

  console.log("searchParams: ",searchParams);
  

  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <ListAllUsers id={id} limit={limit} page={page} />
    </Suspense>
  );
}

export default PageUsers;
