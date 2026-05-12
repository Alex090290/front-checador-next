import { findVacationById } from "@/app/actions/vacations-actions";
import Loading from "@/components/LoadingSpinner";
import ShowInfoVacation from "@/components/vacations/VacationOne";
import { Suspense } from "react";


export default async function VacationsInfoOne({id}:{id:string}){
    
   const vacation = await findVacationById({ id });

    return <>
        <Suspense fallback={<Loading message="Cargando..." />}>
            <ShowInfoVacation vacation={vacation}/>
        </Suspense>
    </>
} 