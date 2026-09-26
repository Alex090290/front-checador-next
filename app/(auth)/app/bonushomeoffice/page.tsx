import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListAllBonusHomeOffice from "./views/ListAllBonusHomeOffice";


type SearchParams = {
    search?: string;
}

async function PageBonusHomeOffice({
    searchParams
}: {
    searchParams?: SearchParams;
}) {

    const search = searchParams?.search ?? "";

    return <>
        <Suspense fallback={<Loading message="Cargando datos..." />}>
            <ListAllBonusHomeOffice search={search} />
        </Suspense>
    </>
}

export default PageBonusHomeOffice;