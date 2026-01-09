import NotFound from "@/app/not-found";
import OverFormView from "./OverFormView";
import OverListView from "./OverListView";
import { IOvertime } from "@/lib/definitions";
import {
  fetchOvertimes,
  getOvertimeById,
} from "@/app/actions/overtime-actions";

async function OvertimeMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: string;
}) {
  let overtimes: IOvertime[] = [];
  let overtime: IOvertime | null = null;

  if (id && id !== "null") {
    overtime = await getOvertimeById({ id });
  }

  [overtimes] = await Promise.all([fetchOvertimes()]);

  if (viewType === "list") {
    return <OverListView overtimes={overtimes} />;
  } else if (viewType === "form") {
    return <OverFormView />;
  } else {
    return <NotFound />;
  }
}

export default OvertimeMainView;
