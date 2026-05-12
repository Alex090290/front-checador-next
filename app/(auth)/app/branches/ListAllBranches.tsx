import { fetchBranchesQueries } from "@/app/actions/branches-actionst";
import BranchesTableClient from "@/components/branches/brancheTableList";
import BrancheInfoOne from "./brancheInfoOne";

export default async function ListAllBranches({
  id,
  page = "1",
  limit = "20",
}: {
  id: string;
  page?: string;
  limit?: string;
}) {
  if (id && id !== "null") return <BrancheInfoOne id={id} />;

  const pageParse = Math.max(Number(page || "1") || 1, 1);
  const limitParse = Math.min(Math.max(Number(limit || "20") || 20, 1), 100);

  const [ branches ] = await Promise.all([
    fetchBranchesQueries({ page: pageParse, limit: limitParse })
  ]);

  return (
      <BranchesTableClient
          branches={branches.data}
          total={branches.total}
          page={pageParse}
          limit={limitParse}
      />
  )
}