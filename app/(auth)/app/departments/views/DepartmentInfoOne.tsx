import { findDepartmentById } from "@/app/actions/departments-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import InfoOneDepartment from "@/components/departments/InfoOneDepartment";

export default async function DepartmentInfoOnePage({id}:{id:string}){

    const [department, employees] = await Promise.all([
        findDepartmentById({ id: Number(id) }),
        fetchEmployees({ page: 1, limit: 500 }),
      ]);

    return (
        <InfoOneDepartment department={department} employees={employees.data} />    
    )

}