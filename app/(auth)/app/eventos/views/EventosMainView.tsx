import { fetchEventos } from "@/app/actions/eventos-actions";
import { fetchEmployees } from "@/app/actions/employee-actions";
import { fetchUsers } from "@/app/actions/user-actions";
import { fetchPendingChecks } from "@/app/actions/pendingChecks-actions";
import { storeAction } from "@/app/actions/storeActions";
import EventsTableClient from "@/components/events/EventsTableClient";
import PendingChecksTableClient from "@/components/events/PendingChecksTableClient";
import { PendingCheckStatusFilter } from "@/lib/pendingChecks/interface";

const PENDING_STATUSES: PendingCheckStatusFilter[] = ["PENDIENTE", "VALIDADA", "RECHAZADA", "TODOS"];

export default async function EventosMainView({
  page = "1",
  limit = "20",
  search = "",
  idUser = "",
  date = "",
  tab = "",
  status = "",
}: {
  id: string;
  page?: string;
  limit?: string;
  search?: string;
  idUser?: string;
  date?: string;
  tab?: string;
  status?: string;
}) {

  const pageParse = Math.max(Number(page || "1") || 1, 1);
  const limitParse = Math.min(Math.max(Number(limit || "20") || 2, 1), 100)

  // Bandeja "Checadas por validar" (DOH): visible con listar_registros_checador; si el back la niega (400/403) se oculta
  const { session } = await storeAction();
  const permissions = session?.permissions ?? [];
  const canListPending = permissions.some((p) => p.text === "listar_registros_checador");
  const canReviewPending = permissions.some((p) => p.text === "actualizar_registros_checador");

  const pendingCount = canListPending
    ? await fetchPendingChecks({ status: "PENDIENTE", page: 1, limit: 1 })
    : null;
  const pendingAllowed =
    !!pendingCount && !(pendingCount.statusCode === 400 || pendingCount.statusCode === 403);
  const pendingTab = pendingAllowed ? { count: pendingCount?.total ?? 0 } : null;

  if (tab === "pendientes" && pendingTab) {
    const statusFilter = PENDING_STATUSES.includes(status as PendingCheckStatusFilter)
      ? (status as PendingCheckStatusFilter)
      : "PENDIENTE";

    const pending = await fetchPendingChecks({
      status: statusFilter,
      search,
      page: pageParse,
      limit: limitParse,
    });

    return (
      <PendingChecksTableClient
        pendingChecks={pending.data}
        total={pending.total}
        errorMessage={pending.success ? "" : pending.message}
        page={pageParse}
        limit={limitParse}
        search={search}
        status={statusFilter}
        pendingCount={pendingTab.count}
        canReview={canReviewPending}
      />
    );
  }

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
      pendingTab={pendingTab}
    />
  )
}
