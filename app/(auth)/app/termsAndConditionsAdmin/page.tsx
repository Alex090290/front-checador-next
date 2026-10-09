export const dynamic = "force-dynamic";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListAllTerms from "./views/ListAllTerms";


type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
  type?: string;
  search?: string;
};

async function PageTermsAndConditionsAdmin({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const id = params?.id ?? "null";

  const page = params?.page ?? "1";
  const limit = params?.limit ?? "20";
  const type = params?.type ?? "";
  const search = params?.search ?? "";

  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <ListAllTerms id={id} limit={limit} page={page} type={type} search={search} />
    </Suspense>
  );
}

export default PageTermsAndConditionsAdmin;
