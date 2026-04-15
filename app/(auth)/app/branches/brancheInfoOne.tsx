import { findBranchById } from "@/app/actions/branches-actionst";
import BrancheOne from "@/components/branches/BrancheInfoOne";

export default async function BrancheInfoOne({id}:{id:string}){

    const branch = await findBranchById({ id: Number(id) });

    return (
        <BrancheOne branch={branch}  />    
    )

}