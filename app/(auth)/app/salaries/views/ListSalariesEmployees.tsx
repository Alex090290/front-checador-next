import { fetchDepartments } from "@/app/actions/departments-actions";
import { fetchBranches } from "@/app/actions/branches-actionst";
import EmployeeSalariesTableClient from "@/components/salaries/EmployeeSalariesTableClient";
import { salariesQueries } from "@/app/actions/salaries-actions";

export default async function ListSalariesEmployees({
  page = "1",
  limit = "20",
  search = "",
  idDepartment,
  idPosition,
  branch,
}: {
  id: string;
  page?: string;
  limit?: string;
  search?: string;
  idDepartment?: string;
  idPosition?: string;
  branch?: string;
}) {
  const pageParse = Math.max(Number(page || "1") || 1, 1);
  const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 100);

  const [employees, departments, branches] = await Promise.all([

    salariesQueries({
      page: pageParse,
      limit: limitParse,
      search,
      idDepartment,
      idPosition,
      branch
    }),
    fetchDepartments(),
    fetchBranches(),

  ]);


  return (
    <EmployeeSalariesTableClient
      total={employees.total}
      page={pageParse}
      limit={limitParse}
      employees={employees.data ?? []}
      search={search}
      departments={departments}
      branches={branches}
      idDepartment={idDepartment}
      idPosition={idPosition}
      branch={branch}
    />
  );
}