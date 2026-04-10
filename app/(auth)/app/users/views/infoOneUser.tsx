import { findUserById } from "@/app/actions/user-actions";
import { fetchPermissions } from "@/app/actions/permission-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import ShowInfoOneUser from "@/components/users/userOne";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";

export default async function UserInfoOne({id}:{id:string}){

    const [findUSer, perms, employees] = await Promise.all([
      findUserById({ id: Number(id) }),
      fetchPermissions(),
      fetchEmployees({ page: 1, limit: 500 }),
    ]);

    return <> 
        {/* <Suspense fallback={<Loading message="Cargando datos..." />}>
          <ShowInfoOneUser user={findUSer} perms={perms} employees={employees} />    
        </Suspense> */}
        <ShowInfoOneUser user={findUSer} perms={perms} employees={employees.data} />    

    </>

}