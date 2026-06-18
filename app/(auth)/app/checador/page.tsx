import LoadingPage from "@/app/LoadingPage";
import { lazy, Suspense } from "react";
import ChecadorFormView from "./views/ChecadorFormView";

type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
  search?: string;
};


async function PageChecador({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}){
  const params = await searchParams;

  const limit = params?.limit ?? "500";

  return (
    <Suspense fallback={<LoadingPage />}>
      <ChecadorFormView limit={limit} />
    </Suspense>
  );
}

export default PageChecador;
