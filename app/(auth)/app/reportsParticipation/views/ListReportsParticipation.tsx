import { getReportsParticipation } from "@/app/actions/reportsParticipation-actions";
import { fetchDepartments } from "@/app/actions/departments-actions";
import { fetchBranches } from "@/app/actions/branches-actionst";
import { storeAction } from "@/app/actions/storeActions";
import ReportsParticipationClient from "@/components/reportsParticipation/ReportsParticipationClient";
import { ParticipationFilter } from "@/lib/reportsParticipation/interface";

const FILTERS: ParticipationFilter[] = ["todos", "participa", "no_participa"];

export default async function ListReportsParticipation({
  page = "1",
  limit = "50",
  search = "",
  idDepartment = "",
  branch = "",
  participation = "todos",
}: {
  page?: string;
  limit?: string;
  search?: string;
  idDepartment?: string;
  branch?: string;
  participation?: string;
}) {
  const pageParse = Math.max(Number(page || "1") || 1, 1);
  const limitParse = Math.min(Math.max(Number(limit || "50") || 50, 1), 500);
  const participationFilter = FILTERS.includes(participation as ParticipationFilter)
    ? (participation as ParticipationFilter)
    : "todos";

  const { session } = await storeAction();
  const canUpdate = (session?.permissions ?? []).some((p) => p.text === "actualizar_participacion_reportes");

  const [list, departments, branches] = await Promise.all([
    getReportsParticipation({
      page: pageParse,
      limit: limitParse,
      search,
      idDepartment,
      branch,
      participation: participationFilter,
    }),
    fetchDepartments(),
    fetchBranches(),
  ]);

  return (
    <ReportsParticipationClient
      employees={list.data}
      total={list.total}
      page={list.page}
      limit={list.limit}
      errorMessage={list.success ? "" : list.message}
      search={search}
      participation={participationFilter}
      departments={departments}
      branches={branches}
      canUpdate={canUpdate}
    />
  );
}
