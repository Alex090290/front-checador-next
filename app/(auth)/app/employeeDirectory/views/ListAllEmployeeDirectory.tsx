import { getEmployeeDirectory } from "@/app/actions/employeeDirectory-actions";
import { fetchDepartments } from "@/app/actions/departments-actions";
import { fetchBranches } from "@/app/actions/branches-actionst";
import EmployeeDirectoryClient from "@/components/employeeDirectory/EmployeeDirectoryClient";

export default async function ListAllEmployeeDirectory({
  page = "1",
  limit = "20",
  search = "",
  idDepartment = "",
  branch = "",
}: {
  page?: string;
  limit?: string;
  search?: string;
  idDepartment?: string;
  branch?: string;
}) {
  const pageParse = Math.max(Number(page || "1") || 1, 1);
  const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 100);

  const [directory, departments, branches] = await Promise.all([
    getEmployeeDirectory({
      page: pageParse,
      limit: limitParse,
      search,
      idDepartment,
      branch,
    }),
    fetchDepartments(),
    fetchBranches(),
  ]);

  return (
    <EmployeeDirectoryClient
      employees={directory.data}
      total={directory.total}
      page={directory.page}
      limit={directory.limit}
      errorMessage={directory.success ? "" : directory.message}
      search={search}
      departments={departments}
      branches={branches}
    />
  );
}
