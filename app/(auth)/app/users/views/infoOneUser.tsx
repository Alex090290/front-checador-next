import { findUserById } from "@/app/actions/user-actions";
import { fetchPermissions } from "@/app/actions/permission-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import ShowInfoOneUser from "@/components/users/userOne";


export default async function UserInfoOne({id}:{id:string}){

    const [findUSer, perms, employees] = await Promise.all([
      findUserById({ id: Number(id) }),
      fetchPermissions(),
      fetchEmployees(),
    ]);

    return <>
        <ShowInfoOneUser user={findUSer} perms={perms} employees={employees} />
    </>

}