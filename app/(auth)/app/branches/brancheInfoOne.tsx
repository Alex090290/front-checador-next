import { findUserById } from "@/app/actions/user-actions";
import { fetchPermissions } from "@/app/actions/permission-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import ShowInfoOneUser from "@/components/users/userOne";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import { findBranchById } from "@/app/actions/branches-actionst";
import BrancheOne from "@/components/branches/BrancheInfoOne";
import { Branch } from "@/lib/definitions";

export default async function BrancheInfoOne({id}:{id:string}){

    let branch: Branch | null;

    [ branch ] = await Promise.all([
        findBranchById({ id: Number(id) })
    ]);

    return (
        <BrancheOne branch={branch}  />    
    )

}