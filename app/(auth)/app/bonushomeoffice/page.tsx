import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import ListAllBonusHomeOffice from "./views/ListAllBonusHomeOffice";

async function PageBonusHomeOffice(){
    return <>
            <Suspense fallback={<Loading message="Cargando datos..." />}>
                <ListAllBonusHomeOffice />
            </Suspense>
        </>
}

export default PageBonusHomeOffice;