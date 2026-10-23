export const dynamic = "force-dynamic";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import moment from "moment-timezone";
import { getVisitors } from "@/app/actions/visitors-actions";
import { storeAction } from "@/app/actions/storeActions";
import VisitorsClient from "@/components/visitors/VisitorsClient";
import { VisitorStatusFilter } from "@/lib/visitors/interface";

type SearchParams = {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

const STATUSES: VisitorStatusFilter[] = ["todos", "dentro", "salieron"];
const isDate = (value?: string) => !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);

async function VisitorsView({ params }: { params?: SearchParams }) {
  const page = Math.max(Number(params?.page ?? "1") || 1, 1);
  const limit = Math.min(Math.max(Number(params?.limit ?? "50") || 50, 1), 100);
  const search = params?.search ?? "";
  const status = STATUSES.includes(params?.status as VisitorStatusFilter) ? (params?.status as VisitorStatusFilter) : "todos";

  // Sin el parámetro en la URL el rango es hoy (hora de México); vacío (dateFrom=) = sin filtro de fecha
  const today = moment.tz("America/Mexico_City").format("YYYY-MM-DD");
  const dateFrom = params?.dateFrom === undefined ? today : isDate(params.dateFrom) ? params.dateFrom : "";
  const dateTo = params?.dateTo === undefined ? today : isDate(params.dateTo) ? params.dateTo : "";

  const [{ session }, list] = await Promise.all([
    storeAction(),
    getVisitors({ page, limit, search, status, dateFrom, dateTo }),
  ]);

  const permissions = session?.permissions ?? [];

  return (
    <VisitorsClient
      visitors={list.data}
      insideNow={list.insideNow}
      total={list.total}
      page={list.page}
      limit={list.limit}
      errorMessage={list.success ? "" : list.message}
      search={search}
      status={status}
      dateFrom={dateFrom}
      dateTo={dateTo}
      canCreate={permissions.some((p) => p.text === "crear_visitantes")}
      canExit={permissions.some((p) => p.text === "actualizar_visitantes")}
    />
  );
}

export default async function PageVisitors({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>
      <VisitorsView params={params} />
    </Suspense>
  );
}
