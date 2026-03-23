import { findVacationById } from "@/app/actions/vacations-actions";
import ShowInfoVacation from "@/components/vacations/VacationOne";


export default async function VacationsInfoOne({id}:{id:string}){
    
   const vacation = await findVacationById({ id });

    return <>
        <ShowInfoVacation vacation={vacation}/>
    </>
} 