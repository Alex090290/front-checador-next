import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListAllBonuskeys from "./views/ListAllBonus";

async function PageBonuskeys() {

    return <>
        <Suspense fallback={<Loading message="Cargando datos..." />}>
            <ListAllBonuskeys />
        </Suspense>
    </>
}
export default PageBonuskeys;
