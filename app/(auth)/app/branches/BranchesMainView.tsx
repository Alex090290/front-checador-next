import NotFound from "@/app/not-found";
import BranchesFormView from "./BranchesFormView";
import BranchesListView from "./BranchesListView";
import { Branch } from "@/lib/definitions";
import { fetchBranches, findBranchById } from "@/app/actions/branches-actionst";

async function BranchesMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: number;
}) {
  let branches: Branch[] = [];
  let branch: Branch | null = null;

  if (id && !isNaN(id)) {
    branch = await findBranchById({ id });
  }

  branches = await fetchBranches();

  if (viewType === "list") {
    return <BranchesListView branches={branches} />;
  } else if (viewType === "form") {
    return <BranchesFormView branch={branch} id={id} />;
  } else {
    return <NotFound />;
  }
}

export default BranchesMainView;
