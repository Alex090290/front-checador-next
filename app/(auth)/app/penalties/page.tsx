import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListAllPenalties from "./views/ListAllPenalties";

type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
  search?: string;
  dateInit?: string;
  dateEnd?: string;
  type?: string;
};

async function PagePenalties({
    searchParams
}: {
    searchParams?: Promise<SearchParams>;
}){
    const params = await searchParams;

    const id = params?.id ?? "null";
    const page = params?.page ?? "1";
    const limit = params?.limit ?? "20";
    const search = params?.search ?? "";

    return (
        <Suspense fallback={<Loading message="Cargando datos..."/>}>
            <ListAllPenalties 
            id={id} 
            limit={limit} 
            page={page} 
            search={search}
            />
        </Suspense>
    )
}

export default PagePenalties;