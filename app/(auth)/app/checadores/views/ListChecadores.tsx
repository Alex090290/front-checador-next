import { getChecadores } from "@/app/actions/checadores-actions";
import { fetchBranches } from "@/app/actions/branches-actionst";
import { storeAction } from "@/app/actions/storeActions";
import ChecadoresClient from "@/components/checadores/ChecadoresClient";

const CHECK_METHODS = ["ambos", "rostro", "pin"];
const STATUSES = ["1", "2", "3"];

export default async function ListChecadores({
  page = "1",
  limit = "50",
  search = "",
  branch = "",
  status = "",
  checkMethods = "",
}: {
  page?: string;
  limit?: string;
  search?: string;
  branch?: string;
  status?: string;
  checkMethods?: string;
}) {
  const pageParse = Math.max(Number(page || "1") || 1, 1);
  const limitParse = Math.min(Math.max(Number(limit || "50") || 50, 1), 100);
  const methodsFilter = CHECK_METHODS.includes(checkMethods) ? checkMethods : "";
  const statusFilter = STATUSES.includes(status) ? status : "";

  const { session } = await storeAction();
  const canUpdate = (session?.permissions ?? []).some((p) => p.text === "actualizar_checadores");

  const [list, branches] = await Promise.all([
    getChecadores({
      page: pageParse,
      limit: limitParse,
      search,
      branch,
      status: statusFilter,
      checkMethods: methodsFilter,
    }),
    fetchBranches(),
  ]);

  return (
    <ChecadoresClient
      checadores={list.data}
      total={list.total}
      page={list.page}
      limit={list.limit}
      errorMessage={list.success ? "" : list.message}
      search={search}
      status={statusFilter}
      checkMethods={methodsFilter}
      branches={branches}
      canUpdate={canUpdate}
    />
  );
}
