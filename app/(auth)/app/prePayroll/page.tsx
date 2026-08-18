import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListPrePayroll from "./views/ListAllPrepayroll";

type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
  search?: string;
  idPeriod?: string;
  year?: string;
};

async function PagePrePayRoll({
    searchParams
}: {
    searchParams?: Promise<SearchParams>;
}){
    const params = await searchParams;

    const id = params?.id ?? "null";
    const page = params?.page ?? "1";
    const limit = params?.limit ?? "20";
    const search = params?.search ?? "";
    const idPeriod = params?.idPeriod ?? ""
    const year = params?.year ?? ""
    

    return (
        <Suspense fallback={<Loading message="Cargando datos..."/>}>
            <ListPrePayroll
            id={id} 
            limit={limit} 
            page={page} 
            search={search}
            idPeriod={idPeriod}
            year={year}
            />
        </Suspense>
    )
}

export default PagePrePayRoll;