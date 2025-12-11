import NotFound from "@/app/not-found";
import VacationsFormView from "./VacationsFormView";
import VacationsListView from "./VacationsListView";
import { Employee, PeriodVacation, Vacations } from "@/lib/definitions";
import {
  fetchPeriods,
  fetchVacations,
  findVacationById,
} from "@/app/actions/vacations-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import { auth } from "@/lib/auth";

async function VacationsMainView({
  viewType,
  id,
}: {
  viewType: string;
  id: string;
}) {
  const session = await auth();

  let vacations: Vacations[] = [];
  let vacation: Vacations | null = null;
  let employees: Employee[] = [];
  let periods: PeriodVacation[] = [];

  if (id && id !== "null") {
    vacation = await findVacationById({ id });
  }

  [vacations, employees, periods] = await Promise.all([
    fetchVacations(),
    fetchEmployees(),
    fetchPeriods({ idEmployee: Number(session?.user?.idEmployee) }),
  ]);

  if (viewType === "list") {
    return <VacationsListView vacations={vacations} />;
  } else if (viewType === "form") {
    return (
      <VacationsFormView
        vacation={vacation}
        id={id}
        employees={employees}
        periods={periods}
      />
    );
  } else {
    return <NotFound />;
  }
}

export default VacationsMainView;
