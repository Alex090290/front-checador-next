import NotFound from "@/app/not-found";
import EventosListView from "./EventosListView";
import { Employee, ICheckInFeedback, User } from "@/lib/definitions";
import { fetchEventos } from "@/app/actions/eventos-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import { fetchUsers } from "@/app/actions/user-actions";

async function EventosMainView({ viewType }: { viewType: string; id: string }) {


  const [eventos, employees, users] = await Promise.all([
    fetchEventos(),
    fetchEmployees({ page: 1, limit: 500 }),
    fetchUsers(),
  ]);

  if (viewType === "list") {
    return (<EventosListView eventos={eventos} users={users} employees={employees.data} />);
  } else {
    return <NotFound />;
  }
}

export default EventosMainView;
