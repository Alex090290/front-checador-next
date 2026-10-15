import { getEmployeeOrgChart } from "@/app/actions/employeeOrgChart-actions";
import { fetchDepartments } from "@/app/actions/departments-actions";
import OrgChartClient from "@/components/orgChart/OrgChartClient";

export default async function ListOrgChart({
  idDepartment = "",
}: {
  idDepartment?: string;
}) {
  const [orgChart, departments] = await Promise.all([
    getEmployeeOrgChart(idDepartment),
    fetchDepartments(),
  ]);

  return (
    <OrgChartClient
      nodes={orgChart.data}
      errorMessage={orgChart.success ? "" : orgChart.message}
      departments={departments}
      idDepartment={idDepartment}
    />
  );
}
