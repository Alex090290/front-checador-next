import { fetchEmployees, findEmployeeById } from "@/app/actions/employee-actions";
import { fetchDepartments } from "@/app/actions/departments-actions";
import { fetchBranches } from "@/app/actions/branches-actionst";
import EmployeeTableClient from "@/components/employee/EmployeeTableList";
import { fetchDocumentTypes } from "@/app/actions/documents-actions";
import { fetchVacationByEmployee } from "@/app/actions/vacations-actions";
import EmployeeDetailsView from "@/components/employee/EmployeeOneInfo";
// import UserInfoOne from "./infoOneUser";

export default async function ListAllEmployees({
  id,
  page = "1",
  limit = "20"
}: {
  id: string;
  page?: string;
  limit?: string;
}) {
//   if (id && id !== "null") return <UserInfoOne id={id} />;
  const pageParse = Math.max(Number(page || "1") || 1, 1);
  const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 100);


  const [employees, departments, branches] = await Promise.all([
    fetchEmployees({ page: pageParse, limit: limitParse }),
    fetchDepartments(),
    fetchBranches(),
  ]);

  if (id && id !== "null") {

    const [employee, documents, vacations] = await Promise.all([
        findEmployeeById({ id: Number(id) }),
        fetchDocumentTypes({ id: Number(id) }),
        fetchVacationByEmployee({ idEmployee: Number(id) }),
      ]);

    return <EmployeeDetailsView 
            branches={branches} 
            departments={departments} 
            employees={employees.data}
            documents={documents}
            employee={employee}
            id={id}
            vacations={vacations}
            />;
    }


  return <>
  
    <EmployeeTableClient
      total={employees.total}
      page={pageParse}
      limit={limitParse}
      employees={employees.data ?? []}
    />
  </>
}