import NotFound from "@/app/not-found";
import EventosListView from "./EventosListView";
import { Employee, ICheckInFeedback, User } from "@/lib/definitions";
import { fetchEventos } from "@/app/actions/eventos-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import { fetchUsers } from "@/app/actions/user-actions";

async function EventosMainView({ viewType }: { viewType: string; id: string }) {
  let eventos: ICheckInFeedback[] = [];
  let employees: Employee[] = [];
  let users: User[] = [];

  [eventos, employees, users] = await Promise.all([
    fetchEventos(),
    fetchEmployees(),
    fetchUsers(),
  ]);

  if (viewType === "list") {
    return (
      <EventosListView eventos={eventos} users={users} employees={employees} />
    );
  } else {
    return <NotFound />;
  }
}

export default EventosMainView;
