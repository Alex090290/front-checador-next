export const dynamic = "force-dynamic";

import { fetchBranches } from "@/app/actions/branches-actionst";
import { fetchDepartments } from "@/app/actions/departments-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import CreateEmployeeComponent from "@/components/employee/CreateEmployee";


export default async function CreateEmployeePage(){


  const [ branches, employees, departments ] = await Promise.all([
    fetchBranches(),
    fetchEmployees({ page: 1, limit: 500 }),
    fetchDepartments()
  ]);

  return <>
    <CreateEmployeeComponent 
      branches={branches}
      departments={departments}
      employees={employees.data}
    />
  </>
}