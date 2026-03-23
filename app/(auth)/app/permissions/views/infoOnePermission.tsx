import { fetchPermissionsById } from "@/app/actions/permissions-actions";
import Loading from "@/components/LoadingSpinner";
import ShowInfoPermissionRequest from "@/components/Permissions/PermissionOne";
import { Suspense } from "react";


export default async function PermissionInfoOne({id}:{id:string}){
    
   const permission = await fetchPermissionsById({ id });

    return <>
        <Suspense fallback={<Loading message="Cargando..." />}>
            <ShowInfoPermissionRequest permission={permission} id={id} />
        </Suspense>
    </>
} 