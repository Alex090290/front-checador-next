import { fetchBranchesQueries } from "@/app/actions/branches-actionst";
import BranchesTableClient from "@/components/branches/brancheTableList";
import { fetchDepartmentsQuery } from "@/app/actions/departments-actions";
import DepartmentsTableList from "@/components/departments/TableListDepartments";
import DepartmentInfoOnePage from "./DepartmentInfoOne";

export default async function ListAllDepartments({
  id,
  page = "1",
  limit = "20",
}: {
  id: string;
  page?: string;
  limit?: string;
}) {
  if (id && id !== "null") return <DepartmentInfoOnePage id={id} />;

  const pageParse = Math.max(Number(page || "1") || 1, 1);
  const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 100);

  const departments = await fetchDepartmentsQuery({ page: pageParse, limit: limitParse })

  return <>
        <DepartmentsTableList
            departments={departments.data}
            total={departments.total}
            page={pageParse}
            limit={limitParse}
        />
  </>
}