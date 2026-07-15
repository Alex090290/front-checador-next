import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListAllAbsences from "./views/ListAllAbsences";

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

async function PageAbsences({
    searchParams
}: {
    searchParams?: Promise<SearchParams>;
}){
    const params = await searchParams;

    const id = params?.id ?? "null";
    const page = params?.page ?? "1";
    const limit = params?.limit ?? "20";
    const search = params?.search ?? "";
    
    const dateInit = params?.dateInit ?? "";
    const dateEnd = params?.dateEnd ?? "";
    const type = params?.type ?? "";

    return (
        <Suspense fallback={<Loading message="Cargando datos..."/>}>
            <ListAllAbsences 
            id={id} 
            limit={limit} 
            page={page} 
            search={search}
            dateInit={dateInit}
            dateEnd={dateEnd}
            type={type}
            />
        </Suspense>
    )
}

export default PageAbsences;