import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListAllDevices from "./views/ListAllDevices";

type SearchParams = {
  view_type?: string;
  id?: string;
  page?: string;
  limit?: string;
  search?: string;
  type?: string;
  status?: string;
  idEmployee?: string;
  idDepartmnet?:string;
  idBranch?: string;
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
    const view_type = params?.view_type ?? "";
    


    return (
        <Suspense fallback={<Loading message="Cargando datos..."/>}>
            <ListAllDevices 
            id={id} 
            limit={limit} 
            page={page} 
            search={search}
            view_type={view_type}
            />
        </Suspense>
    )
}

export default PagePenalties;