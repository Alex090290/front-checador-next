// app/vacations/VacationsMainView.tsx (o donde lo tengas)
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
  searchParams,
}: {
  viewType: string;
  id: string;
  searchParams?: { page?: string; limit?: string };
}) {
  let vacation: Vacations | null = null;
  let employees: Employee[] = [];

  if (id && id !== "null") {
    vacation = await findVacationById({ id });
  }

  const page = Math.max(Number(searchParams?.page ?? 1) || 1, 1);
  const limit = Math.min(Math.max(Number(searchParams?.limit ?? 20) || 20, 1), 100);

  const [vacationsPaged, employeesRes] = await Promise.all([
    fetchVacations({ page, limit }),
    fetchEmployees(),
  ]);

  employees = employeesRes;

  if (viewType === "list") {
    return (
      <VacationsListView
        vacations={vacationsPaged.data}
        total={vacationsPaged.total}
        page={vacationsPaged.page}
        pages={vacationsPaged.pages}
        limit={vacationsPaged.limit}
      />
    );
  } else if (viewType === "form") {
    return (
      <VacationsFormView vacation={vacation} id={id} employees={employees} />
    );
  } else {
    return <NotFound />;
  }
}

export default VacationsMainView;
