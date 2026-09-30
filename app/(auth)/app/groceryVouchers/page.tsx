import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListAllGroceryVouchers from "./views/ListAllGroceryVouchers";

type SearchParams = {
    search?: string;
    page?: string;
    limit?: string;
    idPeriod?: string;
}

async function PageGroceryVouchers({
    searchParams
}: {
    searchParams?: SearchParams;


}) {
    const search = searchParams?.search ?? "";
    const page = searchParams?.page ?? "1";
    const limit = searchParams?.limit ?? "20";
    const idPeriod = searchParams?.idPeriod ?? "";

    return <>
        <Suspense fallback={<Loading message="Cargando datos..." />}>
            <ListAllGroceryVouchers
                search={search}
                page={page}
                limit={limit}
                idPeriod={idPeriod}
            />
        </Suspense>
    </>
}
export default PageGroceryVouchers;
