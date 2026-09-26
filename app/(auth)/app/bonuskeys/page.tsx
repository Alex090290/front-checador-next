import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListAllBonuskeys from "./views/ListAllBonus";

type SearchParams = {
    search?: string;
}


async function PageBonuskeys({
    searchParams
}: {
    searchParams?: SearchParams;
}) {

    const search = searchParams?.search ?? "";

    return <>
        <Suspense fallback={<Loading message="Cargando datos..." />}>
            <ListAllBonuskeys search={search}/>
        </Suspense>
    </>
}
export default PageBonuskeys;
