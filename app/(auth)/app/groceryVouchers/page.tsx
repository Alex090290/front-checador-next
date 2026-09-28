import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListAllGroceryVouchers from "./views/ListAllGroceryVouchers";

type SearchParams = {
    search?: string;
}

async function PageGroceryVouchers({
    searchParams
}: {
    searchParams?: SearchParams;

    
}){
     const search = searchParams?.search ?? "";
    
        return <>
            <Suspense fallback={<Loading message="Cargando datos..." />}>
                <ListAllGroceryVouchers/>
            </Suspense>
        </>
}
export default PageGroceryVouchers;
