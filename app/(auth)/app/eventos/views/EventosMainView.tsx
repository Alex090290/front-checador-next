import { fetchEventos } from "@/app/actions/eventos-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import { fetchUsers } from "@/app/actions/user-actions";
import EventsTableClient from "@/components/events/EventsTableClient";

export default async function EventosMainView({
  page = "1",
  limit = "20",
  search = "",
  idUser = "",
  date = "",
}: {
  id: string;
  page?: string;
  limit?: string;
  search?: string;
  idUser?: string;
  date?: string;
}) {

  const pageParse = Math.max(Number(page || "1") || 1, 1);
  const limitParse = Math.min(Math.max(Number(limit || "20") || 2, 1), 100)

  const [events, employees, users] = await Promise.all([
    fetchEventos({
      page: pageParse,
      limit: limitParse,
      search,
      idUser,
      date
    }),
    fetchEmployees({ page: 1, limit: 500 }),
    fetchUsers(),
  ]);

  return (
    <EventsTableClient
      total={events.total}
      page={Number(page)}
      limit={Number(limit)}
      search={search}
      idUser={idUser}
      events={events.data}
      users={users}
      employees={employees.data}
      date={date}
    />
  )
}