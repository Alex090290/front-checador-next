import NotFound from "@/app/not-found";
import OverFormView from "./OverFormView";
import OverListView from "./OverListView";

async function OvertimeMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: string;
}) {
  if (viewType === "list") {
    return <OverListView />;
  } else if (viewType === "form") {
    return <OverFormView />;
  } else {
    return <NotFound />;
  }
}

export default OvertimeMainView;
