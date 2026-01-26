import { findVacationById } from "@/app/actions/vacations-actions";
import ShowInfoVacation from "@/components/vacations/VacationOne";
import { Vacations } from "@/lib/definitions";


export default async function VacationsInfoOne({id}:{id:string}){

    console.log("id: ",id);
    
   const vacation = await findVacationById({ id });
    
    return <>
        <ShowInfoVacation vacation={vacation}/>
    </>
} 