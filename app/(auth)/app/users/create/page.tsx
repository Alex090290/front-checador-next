import { fetchEmployees } from "@/app/actions/employee-actions";
import { fetchPermissions } from "@/app/actions/permission-actions";
import CreateUserComponent from "@/components/users/CreateUser";


export default async function CreateUserPage(){

  const [ permissions, employees ] = await Promise.all([
    fetchPermissions(),
    fetchEmployees({ page: 1, limit: 500 }),
  ]);

  return <>
    <CreateUserComponent 
      perms={permissions} 
      employees={employees.data} 
    />
  </>
}