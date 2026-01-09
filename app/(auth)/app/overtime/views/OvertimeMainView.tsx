import NotFound from "@/app/not-found";
import OverFormView from "./OverFormView";
import OverListView from "./OverListView";
import { Employee, IOvertime } from "@/lib/definitions";
import {
  fetchOvertimes,
  getOvertimeById,
} from "@/app/actions/overtime-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";

async function OvertimeMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: string;
}) {
  let overtimes: IOvertime[] = [];
  let overtime: IOvertime | null = null;

  let employees: Employee[] = [];

  if (id && id !== "null") {
    overtime = await getOvertimeById({ id });
  }

  [overtimes, employees] = await Promise.all([
    fetchOvertimes(),
    fetchEmployees(),
  ]);

  if (viewType === "list") {
    return <OverListView overtimes={overtimes.reverse()} />;
  } else if (viewType === "form") {
    return <OverFormView id={id} overtime={overtime} employees={employees} />;
  } else {
    return <NotFound />;
  }
}

export default OvertimeMainView;
