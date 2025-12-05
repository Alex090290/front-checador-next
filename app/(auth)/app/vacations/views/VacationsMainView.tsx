import NotFound from "@/app/not-found";
import VacationsFormView from "./VacationsFormView";
import VacationsListView from "./VacationsListView";
import { Employee, Vacations } from "@/lib/definitions";
import {
  fetchVacations,
  findVacationById,
} from "@/app/actions/vacations-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";

async function VacationsMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: string;
}) {
  let vacations: Vacations[] = [];
  let vacation: Vacations | null = null;
  let employees: Employee[] = [];

  if (id && id !== "null") {
    vacation = await findVacationById({ id });
  }

  [vacations, employees] = await Promise.all([
    fetchVacations(),
    fetchEmployees(),
  ]);

  if (viewType === "list") {
    return <VacationsListView vacations={vacations} />;
  } else if (viewType === "form") {
    return (
      <VacationsFormView vacation={vacation} id={id} employees={employees} />
    );
  } else {
    return <NotFound />;
  }
}

export default VacationsMainView;
